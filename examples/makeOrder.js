'use strict';

var ExtractApi = require('../index.js'),
    tableDefinition,
    extract,
    i;

// Define our extract's schema.
tableDefinition = {
  id: 'Extract',
  defaultAlias: 'Orders',
  columns: [{
    id: 'Purchased',
    dataType: 'datetime'
  }, {
    id: 'Product',
    dataType: 'string'
  }, {
    id: 'Price',
    dataType: 'float'
  }, {
    id: 'Quantity',
    dataType: 'int'
  }, {
    id: 'Taxed',
    dataType: 'bool'
  }, {
    id: 'Expiration Date',
    dataType: 'date'
  }, {
    id: 'Destination',
    dataType: 'geometry'
  }]
};

// Instantiate an extract in the current directory named orders-js.hyper.
extract = new ExtractApi('order-js.hyper', tableDefinition);

// For sanity, print out the extract's table definition.
console.log(extract.getDefinition());

// Insert several rows of data.
for (i = 0; i < 10; i++) {
  extract.insert({
    Purchased: '2012-07-03 11:40:12',
    Product: 'Beans',
    Price: 1.08,
    Quantity: i * 10,
    Taxed: i % 2 === 1,
    'Expiration Date': '2029-01-01',
    Destination: 'POINT (30 10)'
  });
}

extract.close();
