'use strict';

var TDE = require('../index.js'),
    extract = new TDE('order-js.tde');

// Publish the extract to the myproject project within the 'mysite' site. If the
// data source already exists, overwrite it.
extract.publish('http://localhost', 'username', process.env.TABPW, 'mysite', 'myproject', true);

extract.close();
