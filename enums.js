'use strict';

var _ = require('underscore'),
  enums = {
    collation: {
      0: 'Binary',
      1: 'ar',
      2: 'cs',
      3: 'cs_CI',
      4: 'cs_CI_AI',
      5: 'da',
      6: 'de',
      7: 'el',
      8: 'en_GB',
      9: 'en_US',
      10: 'en_US_CI',
      11: 'es',
      12: 'es_CI_AI',
      13: 'et',
      14: 'fi',
      15: 'fr_CA',
      16: 'fr_FR',
      17: 'fr_FR_CI_AI',
      18: 'he',
      19: 'hu',
      20: 'is',
      21: 'it',
      22: 'ja',
      23: 'ja_JIS',
      24: 'ko',
      25: 'lt',
      26: 'lv',
      27: 'nl_NL',
      28: 'nn',
      29: 'pl',
      30: 'pt_BR',
      31: 'pt_BR_CI_AI',
      32: 'pt_PT',
      33: 'root',
      34: 'ru',
      35: 'sl',
      36: 'sv_FI',
      37: 'sv_SE',
      38: 'tr',
      39: 'uk',
      40: 'vi',
      41: 'zh_Hans_CN',
      42: 'zh_Hant_TW'
    },
    type: {
      7: 'Integer',
      10: 'Double',
      11: 'Boolean',
      12: 'Date',
      13: 'DateTime',
      14: 'Duration',
      15: 'CharString',
      16: 'UnicodeString',
      17: 'Spatial'
    },
    setMethod: {
      7: 'setLongInteger',
      10: 'setDouble',
      11: 'setBoolean',
      12: 'setDate',
      13: 'setDateTime',
      14: 'setDuration',
      15: 'setCharString',
      16: 'setUnicodeString',
      17: 'setSpatial'
    },
    wdcType: {
      'Duration': 'int',
      'Integer': 'int',
      'Double': 'float',
      'Boolean': 'bool',
      'Date': 'date',
      'DateTime': 'datetime',
      'UnicodeString': 'string',
      'CharString': 'string',
      'Spatial': 'spatial'
    }
  },
  smune = {
    type: _.invert(enums.type),
    collation: _.invert(enums.collation),
    setMethod: _.invert(enums.setMethod),
    wdcType: _.invert(enums.wdcType)
  };

module.exports = {
  type: function(name) {
    return parseInt(smune.type[name]);
  },
  typeName: function (type) {
    return enums.type[type];
  },
  collation: function(name) {
    return parseInt(smune.collation[name]);
  },
  collationName: function(collation) {
    return enums.collation[collation];
  },
  wdcType: function (name) {
    return parseInt(smune.type[smune.wdcType[name]]);
  },
  wdcTypeName: function (type) {
    return enums.wdcType[enums.type[type]];
  },
  typeSetMethod: function (name) {
    return enums.setMethod[parseInt(smune.type[name])];
  },
  typeNameSetMethod: function (type) {
    return enums.setMethod[type];
  }
};
