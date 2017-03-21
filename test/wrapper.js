'use strict';

var chai = require('chai'),
    expect = chai.expect,
    fs = require('fs');

chai.use(require('chai-fs'));
chai.should();

describe('wrapper', function () {
  var tableau = require('../index.js'),
      targetDir = './build/test',
      tableDef = {
        id: 'mocha-test-table',
        columns: [{
          id: 'testBool',
          dataType: 'bool'
        }, {
          id: 'testString',
          dataType: 'string'
        }, {
          id: 'testInt',
          dataType: 'int'
        }, {
          id: 'testDouble',
          dataType: 'float'
        }, {
          id: 'testDate',
          dataType: 'date'
        }, {
          id: 'testDateTime',
          dataType: 'datetime'
        }, {
          id: 'testSpatial',
          dataType: 'spatial'
        }]
      },
      expectedPath,
      extract;

  // These tests actually read/write from/to disk. Account for slowness here.
  this.timeout(20000);

  before(function() {
    // Ensure we have a place to put test extracts.
    fs.mkdirSync(targetDir);

    // Also ensure log files are written there.
    process.env['TAB_SDK_LOGDIR'] = targetDir;
  });

  describe('Extract', function () {

    it('creates an extract file from definition', function () {
      expectedPath = targetDir + '/mocha-from-definition.tde';
      extract = new tableau(expectedPath, tableDef);

      // Ensure the TDE was created.
      expectedPath.should.be.a.file();

      // Also check that definitions match.
      extract.getDefinition().should.deep.equal(tableDef);
    });

    it('can open existing extract even with definition', function () {
      expectedPath = targetDir + '/mocha-existing-with-definition.tde';

      // Create extract via native API.
      tableau.dataExtract(expectedPath).close();

      // Ensure the TDE was created.
      expectedPath.should.be.a.file();

      // Use wrapper API to open existing extract.
      extract = new tableau(expectedPath, tableDef);

      // Also check that the provided definition is returned.
      extract.getDefinition().should.deep.equal(tableDef);
    });

    it('can open existing extract without a definition', function () {
      var expectedDef = {
            id: 'Extract',
            columns: [{
              id: 'columnName',
              dataType: 'bool'
            }]
          },
          existingTde,
          nativeTableDef;

      expectedPath = targetDir + '/mocha-existing-sans-definition.tde';

      // Create extract via native API.
      existingTde = tableau.dataExtract(expectedPath);
      nativeTableDef = tableau.tableDefinition();
      nativeTableDef.addColumn(expectedDef.columns[0].id, tableau.enums.type('Boolean'));
      existingTde.addTable('Extract', nativeTableDef);
      existingTde.close();

      // Ensure the TDE was created.
      expectedPath.should.be.a.file();

      // Use wrapper API to open existing extract without a definition.
      extract = new tableau(expectedPath);

      // Also check that the provided definition is returned.
      extract.getDefinition().should.deep.equal(expectedDef);
    });

    it('throws error instantiating wrapper with invalid TDE path', function () {
      expectedPath = targetDir + '/invalid-tde-name';

      // Attempt to create an extract with an invalid name.
      return expect(tableau.bind(null, expectedPath, tableDef))
        .to.throw();
    });

    it('can insert row when passed as array', function () {
      var beforeSize,
          afterSize;

      // Create a new extract file.
      expectedPath = targetDir + '/row-from-array.tde';
      extract = new tableau(expectedPath, tableDef);
      beforeSize = fs.statSync(expectedPath)['size'];

      // Attempt to insert a row via an array of data.
      extract.insert([
        true,
        'A string',
        -42,
        1.337,
        '2016-01-01',
        '2015-09-23 12:23',
        'LINESTRING(1 1, 3 3)'
      ]);
      extract.close();
      afterSize = fs.statSync(expectedPath)['size'];

      // Ensure that the TDE increased in size.
      return (afterSize > beforeSize).should.be.ok();
    });

    it('can insert row when passed as object', function () {
      var beforeSize,
          afterSize;

      // Create a new extract file.
      expectedPath = targetDir + '/row-from-array.tde';
      extract = new tableau(expectedPath, tableDef);
      beforeSize = fs.statSync(expectedPath)['size'];

      // Attempt to insert a row via an object of data.
      extract.insert({
        testBool: false,
        testDate: '2013-04-21 23:07:01',
        testDateTime: '20130208T080910,123',
        testDouble: 0,
        testInt: null,
        testString: '',
        testSpatial: 'POLYGON((-5 -5, -5 5, 5 5, 5 -5, -5 -5),(3 0, 6 0, 6 3, 3 3, 3 0))'
      });
      extract.close();
      afterSize = fs.statSync(expectedPath)['size'];

      // Ensure that the TDE increased in size.
      return (afterSize > beforeSize).should.be.ok();
    });

    it('throws error when inserting invalid rows', function () {
      expectedPath = targetDir + '/error-invalid-row.tde';
      extract = new tableau(expectedPath, tableDef);

      // This is an error we throw rather than the SDK, so check the text.
      return expect(extract.insert.bind(extract, 'Not an object'))
        .to.throw('Expected row data in the form of an array or object.');
    });

    it('can insert multiple rows', function () {
      var beforeSize,
          afterSize;

      // Create a new extract file.
      expectedPath = targetDir + '/row-from-array.tde';
      extract = new tableau(expectedPath, tableDef);
      beforeSize = fs.statSync(expectedPath)['size'];

      // Attempt to insert multiple rows via in either format.
      extract.insertMultiple([{
        testBool: null,
        testDate: '2013W065',
        testDateTime: '2013-02-08 09Z',
        testDouble: -0.0001,
        testInt: 123,
        testString: 'C',
        testSpatial: null
      }, [
        true,
        null,
        null,
        1,
        '2016-01-01',
        '2015-09-23 12:23',
        'GEOMETRYCOLLECTION(LINESTRING(1 1, 3 5),POLYGON((-1 -1, -1 -5, -5 -5, -5 -1, -1 -1)))'
      ]]);
      extract.close();
      afterSize = fs.statSync(expectedPath)['size'];

      // Ensure that the TDE increased in size.
      return (afterSize > beforeSize).should.be.ok();
    });

    it('throws error when attempting to insert invalid multiples', function () {
      expectedPath = targetDir + '/error-invalid-multiple-rows.tde';
      extract = new tableau(expectedPath, tableDef);

      // This is an error we throw rather than the SDK, so check the text.
      return expect(extract.insertMultiple.bind(extract, {}))
        .to.throw('Expected an array of several rows.');
    });

  });

  describe('Server', function () {

    // @todo Actual test of connection depends on mocking Tableau Server...

    it('throws error when connecting with invalid credentials', function () {
      expectedPath = targetDir + '/mocha-server-invalid-creds.tde';
      extract = new tableau(expectedPath, tableDef);

      expect(extract.publish.bind(extract, 'https://10ay.online.tableau.com', 'testUser', 'testPass'))
        .to.throw();
    });

    afterEach(function () {
      // Delete any log files that have been created.
      fs.unlinkSync(targetDir + '/TableauSDKServer.log');
    });

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
      try {
        fs.unlinkSync(expectedPath);
      }
      catch (e) {}
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
