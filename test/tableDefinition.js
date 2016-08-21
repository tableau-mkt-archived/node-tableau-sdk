'use strict';

var chai = require('chai'),
    expect = chai.expect,
    fs = require('fs');

chai.use(require('chai-fs'));
chai.should();

describe('tableDefinition', function () {
  var tableau = require('../index.js'),
      enums = require('../enums.js'),
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

  it('throws error when adding column with invalid type', function () {
    tableDef = tableau.tableDefinition();

    // Attempt to add a column with an invalid type.
    expect(tableDef.addColumn.bind(tableDef, 'Price', 'InvalidType'))
      .to.throw();
  });

  it('throws error when adding column with duplicate name', function () {
    tableDef = tableau.tableDefinition();
    tableDef.addColumn('Price', enums.type('Double'));

    // Attempt to add a column with the same name.
    expect(tableDef.addColumn.bind(tableDef, 'Price', enums.type('Double')))
      .to.throw();
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

  it('throws error when adding column with collation with invalid type', function () {
    tableDef = tableau.tableDefinition();

    // Attempt to add a column with collation with an invalid type.
    expect(tableDef.addColumnWithCollation.bind(tableDef, 'Price', 'InvalidType'))
      .to.throw();
  });

  it('throws error when adding column with duplicate name', function () {
    tableDef = tableau.tableDefinition();
    tableDef.addColumnWithCollation('Price', enums.type('Double'), enums.collation('ja'));

    // Attempt to add a column with collation with the same name.
    expect(tableDef.addColumnWithCollation.bind(tableDef, 'Price', enums.type('Double'),  enums.collation('ja')))
      .to.throw();
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
