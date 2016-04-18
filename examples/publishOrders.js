'use strict';

var tableau = require('../index.js'),
    serverConnection;

// Create the server connection object.
serverConnection = tableau.serverConnection();

// Connect to the server.
serverConnection.connect('http://localhost', 'username', 'password', 'siteId');

// Publish order-js.tde to the server under the default project w/name Order-js.
serverConnection.publishExtract('order-js.tde', 'default', 'Order-js', false);

// Disconnect from the server and close the connection.
serverConnection.disconnect();
serverConnection.close();
