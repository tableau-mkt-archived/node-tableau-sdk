'use strict';

var chai = require('chai'),
    expect = chai.expect,
    fs = require('fs');

chai.use(require('chai-fs'));
chai.should();

describe('serverConnection', function () {
  var tableau = require('../index.js'),
      targetDir = './build/test',
      serverConnection;

  // These tests actually attempt network requests. Account for slowness here.
  this.timeout(20000);

  before(function() {
    // Ensure we have a place to put test extracts.
    fs.mkdirSync(targetDir);

    // Also ensure log files are written there.
    process.env['TAB_SDK_LOGDIR'] = targetDir;
  });

  it('creates a server connection', function () {
    serverConnection = tableau.serverConnection();

    return serverConnection.disconnect.should.be.a('function');
  });

  it('sets proxy credentials', function () {
    serverConnection = tableau.serverConnection();
    serverConnection.setProxyCredentials('username', 'password');
  });

  it('throws error when connecting with invalid credentials', function () {
    // @todo Actual test of connect depends on mocking Tableau Server...
    serverConnection = tableau.serverConnection();
    expect(serverConnection.connect.bind(serverConnection, 'https://10ay.online.tableau.com', 'testUser', 'testPass', 'testSiteId'))
      .to.throw();
  });

  it('has a publush extract function', function () {
    // @todo Actual test of publish depends on mocking Tableau Server...
    serverConnection = tableau.serverConnection();
    return serverConnection.publishExtract.should.be.a('function');
  });

  afterEach(function () {
    // Destroy any server connections that were created.
    if (serverConnection && serverConnection.close) {
      serverConnection.close();
      serverConnection = null;
    }

    // Delete any log files that have been created.
    fs.unlinkSync(targetDir + '/TableauSDKServer.log');
  });

  after(function () {
    // Clean up the test extract folder.
    fs.rmdirSync(targetDir);
  });

});
