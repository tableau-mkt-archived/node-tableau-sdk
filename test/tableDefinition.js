'use strict';

var chai = require('chai'),
    fs = require('fs');

chai.use(require('chai-fs'));
chai.should();

describe('tableDefinition', function () {
  var tableau = require('../index.js'),
      enums = require('../enums.js'),
      targetDir = './build/test',
      tableDef;

  it('creates a table definition', function () {
    tableDef = tableau.tableDefinition();

    return tableDef.close.should.be.ok;
  });

  it('gets default collation', function () {
    var expectedCollation = enums.collation('Binary');

    tableDef = tableau.tableDefinition();

    return tableDef.getDefaultCollation().should.equal(expectedCollation);
  });

  it('sets default collation', function () {
    var expectedCollation = enums.collation('en_GB');

    tableDef = tableau.tableDefinition();
    tableDef.setDefaultCollation(expectedCollation);

    return tableDef.getDefaultCollation().should.equal(expectedCollation);
  });

  it('gets column count', function () {
    tableDef = tableau.tableDefinition();

    return tableDef.getColumnCount().should.equal(0);
  });

  it('adds column', function () {
    tableDef = tableau.tableDefinition();
    tableDef.addColumn('BoolColumn', enums.type('Boolean'));

    return tableDef.getColumnCount().should.equal(1);
  });

  it('gets column name', function () {
    var expectedColumnName = 'SomeColumnName';

    tableDef = tableau.tableDefinition();
    tableDef.addColumn(expectedColumnName, enums.type('Boolean'));

    return tableDef.getColumnName(0).should.equal(expectedColumnName);
  });

  it('gets column type', function () {
    var expectedColumnType = enums.type('DateTime');

    tableDef = tableau.tableDefinition();
    tableDef.addColumn('DateTimeCol', expectedColumnType);

    return tableDef.getColumnType(0).should.equal(expectedColumnType);
  });

  it('adds column with collation', function () {
    tableDef = tableau.tableDefinition();
    tableDef.addColumnWithCollation('Name', enums.type('CharString'), enums.collation('fr_FR'));

    return tableDef.getColumnCount().should.equal(1);
  });

  it('gets column collation', function () {
    var expectedColumnCollation = enums.collation('ja');

    tableDef = tableau.tableDefinition();
    tableDef.addColumnWithCollation('SomeCol', enums.type('CharString'), expectedColumnCollation);

    return tableDef.getColumnCollation(0).should.equal(expectedColumnCollation);
  });

  afterEach(function () {
    // Close any table definitions that were created.
    if (tableDef && tableDef.close) {
      tableDef.close();
      tableDef = null;
    }
  });

});
