'use strict';

var tableau = require('./build/Release/tableau');

module.exports = {
  dataExtract: tableau.Extract,
  tableDefinition: tableau.TableDefinition,
  tableRow: tableau.Row,
  serverConnection: tableau.ServerConnection,
  enums: require('./enums.js')
};
