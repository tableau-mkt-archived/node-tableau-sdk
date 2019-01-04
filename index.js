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
 * Given a table and table definition, creates a map of column indexes to native
 * extract setter methods. This is a performance optimization.
 */
function instantiateMethodMap(table, definition) {
  // This should never change for a given table. Shortcut this relatively
  // expensive process if it's already known.
  if (priv[table].methodMap) {
    return;
  }

  priv[table].methodMap = definition.columns.map(function (col, i) {
    return enums.typeNameSetMethod(priv[table].nativeTableDefinition.getColumnType(i));
  });
}

/**
 * Helper function that instantiates and stashes a table for subsequent
 * use.
 *
 * @param table
 * @param definition
 */
function instantiateNativeTable(table, definition) {
  priv[table] = priv[table] || {};
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
  instantiateMethodMap(table, definition);
}

/**
 * Sets a given value on the given tableRow for the given table, using them
 * provided index. Just encapsulates row insertion logic.
 * @param {String} table
 *
 * @param {TableRow} tableRow
 *   The native TableauExtract tableRow to set values on.
 * @param {Integer} index
 *   The column number the value should be written to.
 * @param {*} value
 *   The value to be written to the row.
 */
function smartSetValueOnTableRow(table, tableRow, index, value) {
  var method = priv[table].methodMap[index],
      dateTime;

  // If the value is specifically null (or undefined), then set a null value.
  if (value == null) {
    tableRow.setNull(index);
  }
  // Date has a slightly more annoying argument set.
  else if (method === 'setDate') {
    // If the date exactly matches the format "YYYY-MM-DD", then regex it out.
    if (typeof value === 'string') {
      dateTime = value.match(/^(\d{4})-(\d{2})-(\d{2})$/) || moment(value);
    }
    // Otherwise, if the date provided is an instance of moment, use it.
    else {
      dateTime = value instanceof moment ? value : moment(value);
    }

    // If we were successfully able to parse the date via regex, set those values.
    if (dateTime instanceof Array) {
      tableRow[method](index,
        parseInt(dateTime[1]),
        parseInt(dateTime[2]),
        parseInt(dateTime[3])
      );
    }
    // Otherwise, pull the relevant values from moment.
    else {
      tableRow[method](index,
        dateTime.get('year'),
        dateTime.get('month') + 1,
        dateTime.get('date')
      );
    }
  }
  // DateTime has an even more annoying argument set.
  else if (method === 'setDateTime') {
    if (typeof value === 'string') {
      dateTime = value.match(/^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})$/) || moment(value);
    }
    else {
      dateTime = value instanceof moment ? value : moment(value);
    }

    if (dateTime instanceof Array) {
      tableRow[method](index,
        parseInt(dateTime[1]),
        parseInt(dateTime[2]),
        parseInt(dateTime[3]),
        parseInt(dateTime[4]),
        parseInt(dateTime[5]),
        parseInt(dateTime[6]),
        parseInt(dateTime[7])
      );
    }
    else {
      tableRow[method](index,
        dateTime.get('year'),
        dateTime.get('month') + 1,
        dateTime.get('date'),
        dateTime.get('hour'),
        dateTime.get('minute'),
        dateTime.get('second'),
        dateTime.get('millisecond')
      );
    }
  }
  else {
    tableRow[method](index, value);
  }
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

/**
 * Get the definition of the given table.
 *
 * @param {String} table
 *   Table name. If no table name is provided, "Extract" will be assumed.
 *
 * @returns {TableInfo}
 */
Extract.prototype.getDefinition = function (table) {
  table = table || defaultTable;

  // If the definition isn't already loaded, try instantiating it.
  if (!priv[table] || !priv[table].definition) {
    instantiateNativeTable(table);
  }
  return priv[table].definition;
};

/**
 * Closes the extract, writing any new rows to disk and freeing resources.
 */
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

  // If we were passed an object, iterate through the defined columns and try
  // to set values according to the field name specified in the schema.
  if (!(row instanceof Array)) {
    for (i = 0; i < priv[table].definition.columns.length; i++) {
      smartSetValueOnTableRow(table, tableRow, i, row[priv[table].definition.columns[i].id]);
    }
  }
  // Otherwise, just iterate through the provided rows and set them.
  else {
    for (i = 0; i < row.length; i++) {
      smartSetValueOnTableRow(table, tableRow, i, row[i]);
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
