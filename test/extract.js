'use strict';

var chai = require('chai'),
    expect = chai.expect,
    fs = require('fs');

chai.use(require('chai-fs'));
chai.should();

describe('extract', function () {
  var tableau = require('../index.js'),
      targetDir = './build/test',
      expectedPath,
      extract,
      tableDef;

  // These tests actually read/write from/to disk. Account for slowness here.
  this.timeout(5000);

  before(function() {
    // Ensure we have a place to put test extracts.
    fs.mkdirSync(targetDir);

    // Also ensure log files are written there.
    process.env['TAB_SDK_LOGDIR'] = targetDir;
  });

  it('creates an extract file', function () {
    expectedPath = targetDir + '/mocha-create.tde';
    extract = tableau.dataExtract(expectedPath);

    return expectedPath.should.be.a.file;
  });

  it('opens an existing extract file', function () {
    // Create an extract.
    expectedPath = targetDir + '/mocha-create-existing.tde';
    extract = tableau.dataExtract(expectedPath);
    extract.close();
    extract = null;

    // Open the existing extract.
    extract = tableau.dataExtract(expectedPath);

    return extract.close.should.be.ok;
  });

  it('checks if extract has table', function () {
    // Create an extract.
    expectedPath = targetDir + '/mocha-check-table.tde';
    extract = tableau.dataExtract(expectedPath);

    return extract.hasTable('Extract').should.be.false;
  });

  it('throws error when adding invalid table name', function () {
    // Create an extract.
    expectedPath = targetDir + '/mocha-add-invalid-table.tde';
    extract = tableau.dataExtract(expectedPath);

    // Create a table definition.
    tableDef = tableau.tableDefinition();
    tableDef.addColumn('Column', tableau.enums.type('Boolean'));

    // Attempt to add a table with a name other than Extract.
    expect(extract.addTable.bind(extract, 'Invalid', tableDef))
      .to.throw();
  });

  it('adds table to extract', function () {
    // Create an extract.
    expectedPath = targetDir + '/mocha-add-table.tde';
    extract = tableau.dataExtract(expectedPath);

    // Create a table definition.
    tableDef = tableau.tableDefinition();
    tableDef.addColumn('Column', tableau.enums.type('Boolean'));

    return extract.addTable('Extract', tableDef).should.have.property('insert');
  });

  it('opens existing table on extract', function () {
    // Create an extract.
    expectedPath = targetDir + '/mocha-open-table.tde';
    extract = tableau.dataExtract(expectedPath);

    // Create a table definition.
    tableDef = tableau.tableDefinition();
    tableDef.addColumn('Column', tableau.enums.type('Boolean'));
    extract.addTable('Extract', tableDef);

    return extract.openTable('Extract').should.have.property('insert');
  });

  afterEach(function () {
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

    // Delete any TDEs that have been generated.
    if (expectedPath) {
      fs.unlinkSync(expectedPath);
      expectedPath = null;
    }
  });

  after(function () {
    // Also clean out log files.
    fs.unlinkSync(targetDir + '/DataExtract.log');

    // Clean up the test extract folder.
    fs.rmdirSync(targetDir);
  });

});
