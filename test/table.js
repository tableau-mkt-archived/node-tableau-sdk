'use strict';

var chai = require('chai'),
    expect = chai.expect,
    fs = require('fs');

chai.use(require('chai-fs'));
chai.should();

describe('table', function () {
  var tableau = require('../index.js'),
      enums = require('../enums.js'),
      targetDir = './build/test',
      expectedPath,
      extract,
      tableDef,
      table;

  // Some of these tests actually read from disk. Account for slowness here.
  this.timeout(20000);

  before(function() {
    // Ensure we have a place to put test extracts.
    fs.mkdirSync(targetDir);

    // Also ensure log files are written there.
    process.env['TAB_SDK_LOGDIR'] = targetDir;

    // Create an extract fixture.
    expectedPath = targetDir + '/extract-fixture.tde';
    extract = tableau.dataExtract(expectedPath);
    tableDef = tableau.tableDefinition();
    tableDef.setDefaultCollation(enums.collation('en_US'));
    tableDef.addColumnWithCollation('FirstColumn', enums.type('Boolean'), enums.collation('ja'));
    tableDef.addColumnWithCollation('SecondColumn', enums.type('CharString'), enums.collation('en_GB'));
  });

  it('throws error when adding table without name', function () {
    // Attempt to add a table with no name.
    expect(extract.addTable.bind(extract))
      // Note: this exception is defined by us (not Tableau SDK).
      .to.throw('You must provide a table name');
  });

  it('throws error when adding table without a definition', function () {
    // Attempt to add a table with no name.
    expect(extract.addTable.bind(extract, 'Extract'))
      // Note: this exception is defined by us (not Tableau SDK).
      .to.throw('You must provide a table definition');
  });

  it('gets table definition from added table', function () {
    var returnedTableDef;

    // Add table to the extract fixture and return its definition.
    table = extract.addTable('Extract', tableDef);
    returnedTableDef = table.getTableDefinition();

    // Assertions about the expected table definition.
    returnedTableDef.getDefaultCollation().should.equal(enums.collation('en_US'));
    returnedTableDef.getColumnName(0).should.equal('FirstColumn');
    returnedTableDef.getColumnType(0).should.equal(enums.type('Boolean'));
    returnedTableDef.getColumnCollation(0).should.equal(enums.collation('ja'));
    returnedTableDef.getColumnName(1).should.equal('SecondColumn');
    returnedTableDef.getColumnType(1).should.equal(enums.type('CharString'));
    returnedTableDef.getColumnCollation(1).should.equal(enums.collation('en_GB'));
  });

  it('gets table definition from opened table', function () {
    var returnedTableDef;

    // Open the existing table on the extract fixture and return its definition.
    table = extract.openTable('Extract');
    returnedTableDef = table.getTableDefinition();

    // Assertions about the expected table definition.
    returnedTableDef.getDefaultCollation().should.equal(enums.collation('en_US'));
    returnedTableDef.getColumnName(0).should.equal('FirstColumn');
    returnedTableDef.getColumnType(0).should.equal(enums.type('Boolean'));
    returnedTableDef.getColumnCollation(0).should.equal(enums.collation('ja'));
    returnedTableDef.getColumnName(1).should.equal('SecondColumn');
    returnedTableDef.getColumnType(1).should.equal(enums.type('CharString'));
    returnedTableDef.getColumnCollation(1).should.equal(enums.collation('en_GB'));
  });

  it('inserts row', function () {
    var row = tableau.tableRow(tableDef);

    // Add data to the row.
    row.setBoolean(0, true);
    row.setCharString(1, 'Test string is true');

    // Insert the row into the table.
    table = extract.openTable('Extract');
    table.insert(row);

    row.close();
  });

  after(function () {
    // Close any table definitions that were created.
    if (tableDef && tableDef.close) {
      tableDef.close();
      tableDef = null;
    }

    // Close any extracts that were created.
    if (extract && extract.close) {
      extract.close();
      extract = null;
    }

    // Delete the extract fixture.
    if (expectedPath) {
      fs.unlinkSync(expectedPath);
      expectedPath = null;
    }

    // Also clean out log files.
    fs.unlinkSync(targetDir + '/DataExtract.log');

    // Clean up the test extract folder.
    fs.rmdirSync(targetDir);
  });

});
