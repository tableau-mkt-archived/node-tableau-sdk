Tableau SDK (Node.js) [![Build Status](https://travis-ci.org/tableau-mkt/node-tableau-sdk.svg?branch=master)](https://travis-ci.org/tableau-mkt/node-tableau-sdk)
=====================

The official unofficial port of the Tableau SDK (Tableau Data Extract API and
Tableau Server API) for Node.js. Create Tableau Data Extracts and publish them
to Tableau Server and Tableau Online using JavaScript!


## Installation

__Warning__: Under active development. Currently only known to work on OSX and
Ubuntu using LTS versions of node (v4, v6). Check the issue queue for updates or
to contribute improvements!

1. Install the [C/C++ Tableau SDK](https://onlinehelp.tableau.com/current/api/sdk/en-us/help.htm#SDK/tableau_sdk_installing.htm)
   for your platform,
1. You may need to install node-gyp (`npm install node-gyp -g`)
1. If you're on OS X, be sure XCode and command line tools are installed. You
   may need to run `xcode-select --install`
1. Pull the SDK from npm. `npm install tableau-sdk --save`,


## Usage

Check [the examples folder](https://github.com/tableau-mkt/node-tableau-sdk/tree/master/examples)
for sample usage, or see some examples below.

For simplicity, this API borrows the [TableInfo](https://tableau.github.io/webdataconnector/ref/api_ref.html#webdataconnectorapi.tableinfo-1)
and [ColumnInfo](https://tableau.github.io/webdataconnector/ref/api_ref.html#webdataconnectorapi.columninfo)
data structures from the Tableau Web Data Connector API. In addition to the data
types supported by the WDC API, you may specify a column with `dataType` set to
`spatial` for your spatial data needs.

### Create an extract and add data
```javascript
var TDE = require('tableau-sdk'),
    tableDefinition,
    extract;

// Define a two-column table named "Product Prices"
tableDefinition = {
  id: 'Extract',
  defaultAlias: 'Product Prices',
  columns: [
    {id: 'Product', dataType: 'string'},
    {id: 'Price', dataType: 'float'}
  ]
};

// Instantiate a new extract using the definition from above.
extract = new TDE('/path/to/your.tde', tableDefinition);

// Insert data into the extract.
extract.insert({
  Price: 3.99,
  Product: '12 oz Latte'
});

// Close the extract.
extract.close();
```

### Open an existing extract and add data
```javascript
var TDE = require('tableau-sdk'),
    extract;

// Open an extract that already exists.
extract = new TDE('/path/to/your.tde');

// Insert data. Arrays are okay too.
extract.insert([
  '12 oz Americano',
  2.95
]);

extract.close();
```

### Publish an extract to Tableau Server
```javascript
var TDE = require('tableau-sdk'),
    extract;

// Open a reference to the TDE.
extract = new TDE('/path/to/Your DataSource.tde', tableDefinition);

// Publish the extract to your Server instance under the default project and the
// default site. The name of the data source will either be the name provided on
// the "defaultAlias" property of the table definition or "Your DataSource" will
// be parsed from the TDE name/path.
try {
  extract.publish('https://your-corp.internal', 'yourUser', process.env.TABPW);
}
catch (err) {
  console.error('There was a problem publishing the extract to Server:');
  console.error(err);
}
```


## Advanced usage (native APIs)

This API provides a thin wrapper around the native C/C++ Tableau SDK that
handles most use-cases. If you have more advanced use-cases (for example, if you
need to publish to Tableau Server through a proxy, or if you need certain
columns in your extract to be collated a certain way), it's possible for you to
more directly interface with the native C/C++ API.

In those cases, the following static methods are available for you on the main
SDK object:

```javascript
var tableau = require('tableau-sdk');

// @see https://onlinehelp.tableau.com/current/api/sdk/en-us/SDK/C++/html/class_tableau_1_1_extract.html
tableau.dataExtract;

// @see https://onlinehelp.tableau.com/current/api/sdk/en-us/SDK/C++/html/class_tableau_1_1_table_definition.html
tableau.tableDefinition;

// @see https://onlinehelp.tableau.com/current/api/sdk/en-us/SDK/C++/html/class_tableau_1_1_row.html
tableau.tableRow;

// @see https://onlinehelp.tableau.com/current/api/sdk/en-us/SDK/C++/html/class_tableau_1_1_server_connection.html
tableau.serverConnection;

// Methods for converting between C/C++ and JS type constants.
tableau.enums;
```

See [advanced examples](https://github.com/tableau-mkt/node-tableau-sdk/tree/master/examples/advanced)
for more details. You may also wish to refer to the [C++ API reference docs](https://onlinehelp.tableau.com/current/api/sdk/en-us/SDK/C++/html/index.html).
