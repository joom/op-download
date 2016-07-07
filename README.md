# op-download
Download and generate CSV files from Open Procurement tenders API.

## Requirements

You have to have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) on your machine. You must have `mongod` running in order to use the program.

Once you clone the repo, run `npm install` in the repo folder to make sure the npm requirements are installed.

## Usage

First run `node index.js list` to get all tender IDs from the API; this will take a bit time since we can only fetch 100 IDs at a time.

Then run `node index.js update` to fetch the detailed info about each tender. This will take longer since we have to make a separate request for each tender. You can follow the progress.

Then to generate CSV files, you can run `node index.js csv [fields...] > output.csv`. An example call would be `node index.js csv id data.status > output.csv`, which would save something like the following to a file named `output.csv`:

```
"id","data.status"
"0d6d548306914b71a8d15308e398dc80","cancelled"
"2e0aa33eff3a4071a3e267535ec3e1e6","unsuccessful"
"67403dc828034b2eb3c12b40674da3ad","cancelled"
"50e3d6fa89124ee7a54a0ffe44bc0df7","unsuccessful"
```
