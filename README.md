Tableau Extract API (Node.js) [![Build Status](https://travis-ci.org/tableau-mkt/node-tableau-sdk.svg?branch=master)](https://travis-ci.org/tableau-mkt/node-tableau-sdk)
=====================

The official unofficial port of the Tableau Extract API for Node.js. Create Hyper
Extracts for use in Tableau Desktop, Tableau Server, or Tableau Online using JavaScript!


## Installation

__Warning__: Under active development. Currently only known to work on OSX and
Ubuntu using LTS versions of node (v6, v8, v10). Check the issue queue for updates
or to contribute improvements!

1. Install the [C/C++ Tableau SDK](https://onlinehelp.tableau.com/current/api/extract_api/en-us/Extract/extract_api_installing.htm#downloading)
   for your platform,
1. You may need to install node-gyp (`npm install node-gyp -g`)
1. If you're on OS X, be sure XCode and command line tools are installed. You
   may need to run `xcode-select --install`
1. Pull the SDK from npm. `npm install tableau-sdk --save`,


## Usage

Check [the examples folder](https://github.com/tableau-mkt/node-tableau-sdk/tree/master/examples)
for sample usage, or see some examples below.

For simplicity, this API borrows the [TableInfo](https://tableau.github.io/webdataconnector/docs/api_ref.html#webdataconnectorapi.tableinfo-1)
and [ColumnInfo](https://tableau.github.io/webdataconnector/docs/api_ref.html#webdataconnectorapi.columninfo)
data structures from the Tableau Web Data Connector API. In addition to the data
types supported by the WDC API. Note, while the underlying C++ Extract API uses
`Spatial` to indicate spatial data types, the WDC API uses `geometry`. We follow
that convention here too.

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
extract = new TDE('/path/to/your.hyper', tableDefinition);

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
extract = new TDE('/path/to/your.hyper');

// Insert data. Arrays are okay too.
extract.insert([
  '12 oz Americano',
  2.95
]);

extract.close();
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

// @see https://onlinehelp.tableau.com/current/api/extract_api/en-us/Extract/CPP/html/class_tableau_1_1_extract.html
tableau.dataExtract;

// @see https://onlinehelp.tableau.com/current/api/extract_api/en-us/Extract/CPP/html/class_tableau_1_1_table_definition.html
tableau.tableDefinition;

// @see https://onlinehelp.tableau.com/current/api/extract_api/en-us/Extract/CPP/html/class_tableau_1_1_row.html
tableau.tableRow;

// Methods for converting between C/C++ and JS type constants.
tableau.enums;
```

See [advanced examples](https://github.com/tableau-mkt/node-tableau-sdk/tree/master/examples/advanced)
for more details. You may also wish to refer to the [C++ API reference docs](https://onlinehelp.tableau.com/current/api/extract_api/en-us/Extract/CPP/html/index.html).
