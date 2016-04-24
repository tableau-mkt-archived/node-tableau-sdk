'use strict';

var chai = require('chai'),
    fs = require('fs');

chai.use(require('chai-fs'));
chai.should();

describe('tableRow', function () {
  var tableau = require('../index.js'),
      enums = require('../enums.js'),
      tableDef,
      tableRow;

  before(function () {
    // Define a table to use with each test.
    tableDef = tableau.tableDefinition();
    tableDef.setDefaultCollation(enums.collation('en_US'));
    tableDef.addColumn('IntColumn', enums.type('Integer'));
    tableDef.addColumn('DoubleColumn', enums.type('Double'));
    tableDef.addColumn('BoolColumn', enums.type('Boolean'));
    tableDef.addColumn('DateColumn', enums.type('Date'));
    tableDef.addColumn('DateTimeColumn', enums.type('DateTime'));
    tableDef.addColumn('DurationColumn', enums.type('Duration'));
    tableDef.addColumn('CharStringColumn', enums.type('CharString'));
    tableDef.addColumn('UnicodeStringColumn', enums.type('UnicodeString'));
  });

  it('creates a table row', function () {
    tableRow = tableau.tableRow(tableDef);

    return tableRow.setNull.should.be.ok;
  });

  it('sets null values', function () {
    tableRow = tableau.tableRow(tableDef);
    tableRow.setNull(0);
  });

  it('sets integer values', function () {
    tableRow = tableau.tableRow(tableDef);
    tableRow.setInteger(0, -123);
    tableRow.setInteger(0, 0);
    tableRow.setInteger(0, 123);
  });

  it('sets long integer values', function () {
    tableRow = tableau.tableRow(tableDef);
    tableRow.setLongInteger(0, -2147483648);
    tableRow.setLongInteger(0, 0);
    tableRow.setLongInteger(0, 2147483647);
  });

  it('sets double values', function () {
    tableRow = tableau.tableRow(tableDef);
    tableRow.setDouble(1, -0.123);
    tableRow.setDouble(1, 0.0);
    tableRow.setDouble(1, 12.34567);
  });

  it('sets boolean values', function () {
    tableRow = tableau.tableRow(tableDef);
    tableRow.setBoolean(2, false);
    tableRow.setBoolean(2, true);
  });

  it('sets date values', function () {
    tableRow = tableau.tableRow(tableDef);
    tableRow.setDate(3, 2016, 4, 24);
    tableRow.setDate(3, 1959, 3, 27);
    tableRow.setDate(3, 3000, 12, 31);
  });

  it('sets date/time values', function () {
    tableRow = tableau.tableRow(tableDef);
    tableRow.setDateTime(4, 2016, 4, 24, 16, 44, 23, 0);
    tableRow.setDateTime(4, 1959, 3, 27, 1, 0, 0, 0, 0);
    tableRow.setDateTime(4, 3000, 12, 31, 20, 9, 14, 100);
  });

  it('sets duration values', function () {
    tableRow = tableau.tableRow(tableDef);
    tableRow.setDuration(5, 1, 0, 5, 0, 0);
    tableRow.setDuration(5, 0, 23, 0, 59, 0);
    tableRow.setDuration(5, 0, 0, 59, 59, 100);
  });

  it('sets charstring values', function () {
    tableRow = tableau.tableRow(tableDef);
    tableRow.setCharString(6, 'A string value');
    tableRow.setCharString(6, "A quoted string value");
    tableRow.setCharString(6, '1');
    tableRow.setCharString(6, false.toString());
  });

  it('sets unicode string values', function () {
    tableRow = tableau.tableRow(tableDef);
    tableRow.setString(7, 'A string value');
    tableRow.setString(7, "A quoted string value");
    tableRow.setString(7, '1');
    tableRow.setString(7, false.toString());
  });

  afterEach(function () {
    // Close any table rows that were created.
    if (tableRow && tableRow.close) {
      tableRow.close();
      tableRow = null;
    }
  });

  after(function () {
    // Close the table definition.
    tableDef.close();
    tableDef = null;
  });
});
