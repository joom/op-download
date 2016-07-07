#!/usr/bin/env node

var chalk   = require('chalk');
var mongo   = require('mongojs');
var request = require('request');
var async   = require('async');
var program = require('commander');
var json2csv = require('json2csv');

var connect = function () {
 return require("mongojs")("127.0.0.1:27017/op", ['tenders']);
};

program.version('0.0.1');

program
  .command('list')
  .description('Fetch the list of tenders from scratch')
  .action(function() {
    var db  = connect();
    var num = 0;
    var rec = function (uri) {
      request(uri, function (err, res, body) {
        body = JSON.parse(body);
        var len = body.data.length;
        num += len;
        body.data.forEach(function (obj) {
          db.tenders.insert({id : obj.id}, function (err) {
            if(err) {
              process.stderr.write(chalk.red("There is an error: " + err));
              process.exit();
            }
          });
        });
        if (len > 0) {
          rec(body.next_page.uri);
        } else {
          process.stdout.write(chalk.green("\nDownloaded " + num + " tender IDs."));
          process.stdout.write(chalk.green("\nDONE! Added " + num + " tenders to the database."));
          process.exit();
        }
      });
      process.stdout.write(chalk.yellow(num + " tenders fetched...\r"));
    };
    db.tenders.remove({}, function (err) {
      if(err) {return;}
      process.stdout.write(chalk.green("Removed all existing tenders in the database.\n"));
      rec("https://public.api.openprocurement.org/api/2.3/tenders");
    });
  });

program
  .command('update')
  .description('Update the tenders with the tender ID for each.')
  .action(function () {
    process.stdout.write(chalk.yellow("Starting update...\r"));
    var db  = connect();
    var num = 0;
    db.tenders.find({}, function (err, list) {
      var total = list.length;
      async.parallel(
        list.map(function (doc) {
          return function (cb) {
            request("https://public.api.openprocurement.org/api/2.3/tenders/" + doc.id, function (err, res, body) {
              body = JSON.parse(body);
              body.id = doc.id;
              db.tenders.update({id : doc.id} , body, function (err) {
                num++;
                process.stdout.write(chalk.green("Fetched detailed info for " + num + " tenders in the database.\r"));
                cb(null, num);
              });
            });
          };
        }) , function (err, results) {
        process.stdout.write(chalk.green("Successfully fetched detailed info for " + num + "/" + total + " tenders in the database."));
        process.exit();
      });
    });
  });

program
  .command('csv [fields...]')
  .description('Generate a CSV file from the given fields in the database.')
  .action(function (fields) {
    var db  = connect();
    db.tenders.find({},{_id: 0, id:1, "data.status": 1}, function (err, data) {
      json2csv({ data: data, fields: fields }, function(err, csv) {
        if (err) console.log(err);
        process.stdout.write(csv);
        process.exit();
      });
    });
  });
program.parse(process.argv);
