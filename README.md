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
let ExtractApi = require('tableau-sdk'),
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
extract = new ExtractApi('/path/to/your.hyper', tableDefinition);

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
let ExtractApi = require('tableau-sdk'),
    extract;

// Open an extract that already exists.
extract = new ExtractApi('/path/to/your.hyper');

// Insert data. Arrays are okay too.
extract.insert([
  '12 oz Americano',
  2.95
]);

extract.close();
```

### Create a multi-table extract and add data
```javascript
let ExtractApi = require('tableau-sdk'),
    tables,
    extract;

// Define a two-column table named "Product Prices"
tables = {
  products: {
    id: 'Products',
    defaultAlias: 'Products',
    columns: [
      {id: 'ProductID', dataType: 'int'},
      {id: 'Product', dataType: 'string'},
      {id: 'Price', dataType: 'float'}
    ]
  },
  orders: {
    id: 'Orders',
    defaultAlias: 'Product Orders',
    columns: [
      {id: 'OrderID', dataType: 'int'},
      {id: 'ProductID', dataType: 'int'},
      {id: 'Customer', dataType: 'string'}
    ]
  }
};

// Instantiate a new extract and add your tables.
extract = new ExtractApi('/path/to/your.hyper');
extract.addTable('Products', tables.products);
extract.addTable('Orders', tables.orders);

// Insert data into the Products table.
extract.insert('Products', [{
  ProductID: 1,
  Product: '12 oz Latte',
  Price: 3.99
}, {
  ProductID: 2,
  Product: '16 oz Latte',
  Price: 4.99
}]);

// Insert data into the Orders table.
extract.insert(tables.orders.id, {
  OrderID: 1,
  ProductID: 2,
  Customer: 'Jane'
});

// Close the extract.
extract.close();
```

### Date handling
If your extract includes a date or datetime, you can pass the value in one of
three ways:

- As a string that is in an ISO format recognized by [moment.js](https://momentjs.com/).
  This is the simplest way to insert dates into to your extract
- As a string exactly conforming to either `YYYY-MM-DD` or `YYYY-MM-DD HH:MM:SS`.
  This is the most performant way to insert dates into your extract, and is
  recommended for very large datasets wherever possible.
- As an object instance of `moment`. This maybe the most performant way to
  insert dates into your extract in situations where you are already using the
  `moment.js` library to manipulate dates.


## Advanced usage (native APIs)

This API provides a thin wrapper around the native C/C++ Tableau SDK that
handles most use-cases. If you have more advanced use-cases (for example, if you
need certain columns in your extract to be collated a certain way), it's
possible for you to more directly interface with the native C/C++ API.

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
