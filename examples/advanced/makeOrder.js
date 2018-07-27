'use strict';

var tableau = require('../../index.js'),
    enums = tableau.enums;

/**
 * Define the table's schema.
 * @returns TableDefinition
 */
var makeTableDefinition = function() {
  var def = new tableau.tableDefinition();
  def.setDefaultCollation(enums.collation('en_GB'));
  def.addColumn('Purchased', enums.type('DateTime'));
  def.addColumn('Product', enums.type('CharString'));
  def.addColumn('uProduct', enums.type('UnicodeString'));
  def.addColumn('Price', enums.type('Double'));
  def.addColumn('Quantity', enums.type('Integer'));
  def.addColumn('Taxed', enums.type('Boolean'));
  def.addColumn('Expiration Date', enums.type('Date'));
  def.addColumnWithCollation('Produkt', enums.type('CharString'), enums.collation('de'));
  def.addColumn('Destination', enums.type('Spatial'));
  return def;
};

/**
 * Log a Table's schema to the console.
 * @param TableDefinition def
 */
var printTableDefinition = function(def) {
  var numColumns = def.getColumnCount(),
      i;

  for (i = 0; i < numColumns; i++) {
    console.log(
      'Column ' + i + ':',
      def.getColumnName(i),
      enums.typeName(def.getColumnType(i)),
      enums.collationName(def.getColumnCollation(i))
    );
  }
};

/**
 * Insert a few rows of data.
 * @param Table table
 */
var insertData = function(table) {
  var tableDef = table.getTableDefinition(),
      row = tableau.tableRow(tableDef),
      i;

  row.setDateTime(0, 2012, 7, 3, 11, 40, 12, 4550); // Purchased
  row.setCharString(1, 'Beans'); // Product
  row.setString(2, 'uniBeans'); // Unicode Product
  row.setDouble(3, 1.08); // Price
  row.setDate(6, 2029, 1, 1); // Expiration Date
  row.setCharString(7, 'Böhnen'); // Produkt
  raw.setSpatial(8, 'POINT (30 10)'); // Destination

  for (i = 0; i < 10; i++) {
    row.setInteger(4, i * 10); // Quantity
    row.setBoolean(5, i % 2 === 1); // Taxed
    table.insert(row);
  }
};

var extract = new tableau.dataExtract('order-js.hyper'),
    table,
    tableDef;

if (!extract.hasTable('Extract')) {
  tableDef = makeTableDefinition();
  table = extract.addTable('Extract', tableDef);
}
else {
  table = extract.openTable('Extract');
}

printTableDefinition(table.getTableDefinition());

insertData(table);

extract.close();
