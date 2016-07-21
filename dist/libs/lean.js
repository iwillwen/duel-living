'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _leanengine = require('leanengine');

var _leanengine2 = _interopRequireDefault(_leanengine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_leanengine2.default.init({
  appId: process.env.LEANCLOUD_APP_ID || 'ELBaq12R4z7KStmFxmHFTMoz-gzGzoHsz',
  appKey: process.env.LEANCLOUD_APP_KEY || 'ivla7obQDyez9WH0pX6HuwrK',
  masterKey: process.env.LEANCLOUD_APP_MASTER_KEY || 'wv94VmOmQFvyALD9Ixj4cXlf'
});

_leanengine2.default.Cloud.useMasterKey();

exports.default = _leanengine2.default;