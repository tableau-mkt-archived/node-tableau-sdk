Tableau SDK (Node.js) [![Build Status](https://travis-ci.org/tableau-mkt/node-tableau-sdk.svg?branch=master)](https://travis-ci.org/tableau-mkt/node-tableau-sdk)
=====================

The unofficial port of the Tableau SDK (Tableau Data Extract API and Tableau
Server API) for Node.js. Create Tableau Data Extracts and publish them to
Tableau Server and Tableau Online using JavaScript!


## Installation

__Warning__: Under active development. Currently only known to work on OSX 10.9.
Check the issue queue for updates.

Install the [C/C++ Tableau SDK](https://onlinehelp.tableau.com/current/api/sdk/en-us/help.htm#SDK/tableau_sdk_installing.htm)
for your platform.

1. Install the [C/C++ Tableau SDK](https://onlinehelp.tableau.com/current/api/sdk/en-us/help.htm#SDK/tableau_sdk_installing.htm)
   for your platform.
1. Pull the SDK from npm. `npm install tableau-sdk --save`.


## Usage

Check [the examples folder](/tableau-mkt/node-tableau-sdk/tree/master/examples)
for sample usage, or see some simple examples below.

The API currently _very_ closely mirrors the C++ API, whose reference docs can
be [found here](https://onlinehelp.tableau.com/current/api/sdk/en-us/SDK/C++/html/index.html).

### Create an extract and add data
```javascript
var tableau = require('tableau-sdk'),
    enums = tableau.enums,
    extract,
    tableDef,
    table,
    row;

// Define your two-column table.
tableDef = tableau.tableDefinition();
tableDef.addColumn('Product', enums.type('CharString'));
tableDef.addColumn('Price', enums.type('Double'));

// Create an extract at /path/to/your.tde
extract = new tableau.extract('/path/to/your.tde');

// Add your table definition to the extract.
table = extract.addTable('extract', tableDef);

// Create a row of data.
row = tableau.tableRow(tableDef);
row.setCharString(0, '12 oz Latte');
row.setDouble(1, 3.99);

// Insert the row into the extract.
table.insert(row);

// Close the extract.
extract.close();
```

### Publish a TDE to Tableau Server
```javascript
var tableau = require('tableau-sdk'),
    serverConnection;

// Instantiate the server connection.
serverConnection = tableau.serverConnection();

// Connect to the server.
serverConnection.connect('http://localhost', 'username', 'password', 'siteId');

// Publish your.tde to the server under the default project, named My-TDE.
serverConnection.publishExtract('/path/to/your.tde', 'default', 'My-TDE', false);

// Disconnect from the server and close the connection.
serverConnection.disconnect();
serverConnection.close();
```
