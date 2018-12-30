'use strict';

var tableau = require('./build/Release/tableau'),
    _ = require('underscore'),
    moment = require('moment'),
    enums = require('./enums'),
    priv = {},
    defaultTable = 'Extract';

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
 * @param tableName
 * @returns {{id: string, columns: Array}}
 */
function convertTdeApiTableDefToWdc(tableDef, tableName) {
  var columnCount = tableDef.getColumnCount(),
      template = {id: '', columns: []},
      columnTemplate = {},
      i;

  template.id = tableName || defaultTable;

  for (i = 0; i < columnCount; i++) {
    columnTemplate.dataType = enums.wdcTypeName(tableDef.getColumnType(i));
    columnTemplate.id = tableDef.getColumnName(i);
    template.columns.push(columnTemplate);
    columnTemplate = {};
  }

  return template;
}

/**
 * Helper function that instantiates and stashes a table for subsequent
 * use.
 *
 * @param table
 * @param definition
 */
function instantiateNativeTable(table, definition) {
  priv[table] = {};
  priv[table].tableName = table;

  // If a definition was provided, apply the table definition to the extract.
  if (definition) {
    // Convert the given definition to a native table definition object.
    priv[table].nativeTableDefinition = convertWdcTableDefToTdeApi(definition);

    // If a table exists, open and store a reference to the existing table.
    if (priv.nativeExtract.hasTable(table)) {
      priv[table].nativeTable = priv.nativeExtract.openTable(table);
    }
    // Otherwise, create the table with the given definition.
    else {
      priv[table].nativeTable = priv.nativeExtract.addTable(table, priv[table].nativeTableDefinition);
    }
  }
  else {
    if (priv.nativeExtract.hasTable(table)) {
      priv[table].nativeTable = priv.nativeExtract.openTable(table);
      priv[table].nativeTableDefinition = priv[table].nativeTable.getTableDefinition();
      definition = convertTdeApiTableDefToWdc(priv[table].nativeTableDefinition, table);
    }
  }

  priv[table].definition = definition;
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
  var table = definition && definition.id ? definition.id : defaultTable;

  priv.path = path;
  priv.nativeExtract = new tableau.Extract(priv.path);
  instantiateNativeTable(table, definition);
}

/**
 * Adds another table to the Tableau extract.
 *
 * @param {String} table
 *   The name of the table.
 * @param {TableInfo} definition
 *   A table definition, in the same format as the Tableau WDC API.
 */
Extract.prototype.addTable = function (table, definition) {
  instantiateNativeTable(table, definition);
};

Extract.prototype.getDefinition = function (table) {
  table = table || defaultTable;

  // If the definition isn't already loaded, try instantiating it.
  if (!priv[table] || !priv[table].definition) {
    instantiateNativeTable(table);
  }
  return priv[table].definition;
};

Extract.prototype.close = function () {
  return priv.nativeExtract.close();
};

/**
 * Given an array of row values (or an object, keyed by column IDs), this
 * method appends the given data to the extract.
 *
 * @param {String} table
 * @param {Array|Object} row
 */
Extract.prototype.insert = function insert(table, row) {
  // Handle backward compatibility for pre-multi-table extracts.
  if (row === undefined) {
    row = table;
    table = defaultTable;
  }

  var tableRow = tableau.Row(priv[table].nativeTableDefinition),
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
      rowIndex = _.findIndex(priv[table].definition.columns, function (column) {
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
    method = enums.typeNameSetMethod(priv[table].nativeTableDefinition.getColumnType(i));

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
  priv[table].nativeTable.insert(tableRow);
};

/**
 * Identical to the insert method, but rather than taking a single row, it takes
 * an array of row objects/arrays.
 *
 * @param {String} table
 * @param {Array} rows
 */
Extract.prototype.insertMultiple = function insertMultiple(table, rows) {
  // Handle backward compatibility for pre-multi-table extracts.
  if (rows === undefined) {
    rows = table;
    table = defaultTable;
  }

  var i;

  // If the row is not an array, we've got problems.
  if (!(rows instanceof Array)) {
    throw 'Expected an array of several rows.';
  }

  for (i = 0; i < rows.length; i++) {
    this.insert(table, rows[i]);
  }
};

// Make raw C++ APIs available for advanced use-cases / legacy usage.
Extract.dataExtract = tableau.Extract;
Extract.tableDefinition = tableau.TableDefinition;
Extract.tableRow = tableau.Row;
Extract.enums = require('./enums.js');

module.exports = Extract;
