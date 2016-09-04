'use strict';

var tableau = require('./build/Release/tableau'),
    _ = require('underscore'),
    moment = require('moment'),
    enums = require('./enums'),
    priv = {};

/**
 * Given a WDC API TableInfo object, this function will return a native Tableau
 * extract table definition object.
 *
 * @param {{id: string, columns: Array}} def
 * @returns {Object}
 */
function convertWdcTableDefToTdeApi(def) {
  var tableDef = tableau.TableDefinition(),
      i;

  for (i = 0; i < def.columns.length; i++) {
    tableDef.addColumn(def.columns[i].id, enums.wdcType(def.columns[i].dataType));
  }

  return tableDef;
}

/**
 * Given a native Tableau extract table definition object, this function will
 * return a TableInfo object according to the specifications of the WDC API.
 *
 * @param tableDef
 * @returns {{id: string, columns: Array}}
 */
function convertTdeApiTableDefToWdc(tableDef) {
  var columnCount = tableDef.getColumnCount(),
      template = {id: '', columns: []},
      columnTemplate = {},
      i;

  template.id = 'Extract';

  for (i = 0; i < columnCount; i++) {
    columnTemplate.dataType = enums.wdcTypeName(tableDef.getColumnType(i));
    columnTemplate.id = tableDef.getColumnName(i);
    template.columns.push(columnTemplate);
    columnTemplate = {};
  }

  return template;
}

/**
 * Instantiates a new Tableau extract wrapper.
 *
 * @param {String} path
 * @param {TableInfo} definition
 *   An optional table definition, in the same format as the Tableau WDC API.
 * @constructor
 */
function Extract(path, definition) {
  priv.tableName = 'Extract';
  priv.path = path;
  priv.nativeExtract = new tableau.Extract(priv.path);

  // If a definition was provided, apply the table definition to the extract.
  if (definition) {
    // Convert the given definition to a native table definition object.
    priv.nativeTableDefinition = convertWdcTableDefToTdeApi(definition);

    // If a table exists, open and store a reference to the existing table.
    if (priv.nativeExtract.hasTable(priv.tableName)) {
      priv.nativeTable = priv.nativeExtract.openTable(priv.tableName);
    }
    // Otherwise, create the table with the given definition.
    else {
      priv.nativeTable = priv.nativeExtract.addTable(priv.tableName, priv.nativeTableDefinition);
    }
  }
  // Otherwise, get the table definition from the existing TDE.
  else {
    priv.nativeTable = priv.nativeExtract.openTable(priv.tableName);
    priv.nativeTableDefinition = priv.nativeTable.getTableDefinition();
    definition = convertTdeApiTableDefToWdc(priv.nativeTableDefinition);
  }

  priv.definition = definition;
}

Extract.prototype.getDefinition = function () {
  return priv.definition;
};

Extract.prototype.close = function () {
  return priv.nativeExtract.close();
};

/**
 * Given an array of row values (or an object, keyed by column IDs), this
 * method appends the given data to the extract.
 *
 * @param {Array|Object} row
 */
Extract.prototype.insert = function insert(row) {
  var tableRow = tableau.Row(priv.nativeTableDefinition),
      tempRow = [],
      rowKey,
      rowIndex,
      method,
      dateTime,
      i;

  // If the row is neither an array nor an object, we've got problems.
  if (typeof row !== 'object') {
    throw 'Expected row data in the form of an array or object.';
  }

  // Convert objects to arrays based on the table definition.
  if (!(row instanceof Array)) {
    for (rowKey in row) {
      // Ensure we're only looking at object properties, nothing fancy.
      if (!row.hasOwnProperty(rowKey)) {
        continue;
      }

      // Find the index of the column with this ID.
      rowIndex = _.findIndex(priv.definition.columns, function (column) {
        return column.id === rowKey;
      });

      // If a column with this ID was found, add it to the template!
      if (rowIndex !== -1) {
        tempRow[rowIndex] = row[rowKey];
      }
    }

    // Set our temporary row as THE row.
    row = tempRow;
  }

  for (i = 0; i < row.length; i++) {
    // Determine the set method to use.
    method = enums.typeNameSetMethod(priv.nativeTableDefinition.getColumnType(i));

    // If the value is specifically null (or undefined), then set a null value.
    if (row[i] == null) {
      tableRow.setNull(i);
    }
    // Date has a slightly more annoying argument set.
    else if (method === 'setDate') {
      dateTime = moment(row[i]);
      tableRow[method](i,
        dateTime.get('year'),
        dateTime.get('month') + 1,
        dateTime.get('date')
      );
    }
    // DateTime has an even more annoying argument set.
    else if (method === 'setDateTime') {
      dateTime = moment(row[i]);
      tableRow[method](i,
        dateTime.get('year'),
        dateTime.get('month') + 1,
        dateTime.get('date'),
        dateTime.get('hour'),
        dateTime.get('minute'),
        dateTime.get('second'),
        dateTime.get('millisecond')
      );
    }
    else {
      tableRow[method](i, row[i]);
    }
  }

  // Insert the row!
  priv.nativeTable.insert(tableRow);
};

/**
 * Identical to the insert method, but rather than taking a single row, it takes
 * an array of row objects/arrays.
 * @param {Array} rows
 */
Extract.prototype.insertMultiple = function insertMultiple(rows) {
  var i;

  // If the row is not an array, we've got problems.
  if (!(rows instanceof Array)) {
    throw 'Expected an array of several rows.';
  }

  for (i = 0; i < rows.length; i++) {
    this.insert(rows[i]);
  }
};

/**
 * Publishes the extract to a Tableau Server instance as the given user within
 * the given site and project. If a "defaultAlias" property was passed in on the
 * extract definition object, it will be used as the data source name when it is
 * uploaded to the site/project. If none was provided, a name will be parsed
 * from the extract's file name.
 *
 * @param {String} host
 *   Fully qualified URL of the server to publish to.
 * @param {String} user
 *   The username of the user to sign in as. The user must have permissions to
 *   publish to the specified site.
 * @param {String} password
 *   The password of the user to sign in as.
 * @param {String|null} siteId
 *   Optional. The ID of the site under which this TDE will be available. If no
 *   siteId is given, the default site will be used.
 * @param {String|null} project
 *   Optional. The name of the project to publish the TDE to. If no project name
 *   is given, the default project will be used.
 * @param {Boolean|null} overwrite
 *   Optional. A flag indicating whether or not we should overwrite an existing
 *   TDE by the same name in the same site/project. Defaults to false.
 */
Extract.prototype.publish = function publish(host, user, password, siteId, project, overwrite) {
  var serverConnection = tableau.ServerConnection(),
      name = priv.definition.defaultAlias;

  // Set up defaults.
  siteId = siteId == null ? '' : siteId;
  project = project == null ? 'default' : project;
  name = typeof name === 'undefined' ? priv.path.match(/([a-zA-Z0-9_\-\s]+).tde$/)[1] : name;
  overwrite = overwrite == null ? false : overwrite;

  // Connect to the server.
  serverConnection.connect(host, user, password, siteId);

  // Publish your.tde to the server under the default project, named My-TDE.
  serverConnection.publishExtract(priv.path, project, name, overwrite);

  // Disconnect from the server and close the connection.
  serverConnection.disconnect();
  serverConnection.close();
};

// Make raw C++ APIs available for advanced use-cases / legacy usage.
Extract.dataExtract = tableau.Extract;
Extract.tableDefinition = tableau.TableDefinition;
Extract.tableRow = tableau.Row;
Extract.serverConnection = tableau.ServerConnection;
Extract.enums = require('./enums.js');

module.exports = Extract;
