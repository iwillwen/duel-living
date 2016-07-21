'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Host = require('../models/Host');

var _Host2 = _interopRequireDefault(_Host);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = {
  get: {},
  post: {}
};

router.get.checkIsLogined = function* () {
  this.body = {
    logined: !!this.req.currentUser
  };
};

router.post.login = function* () {
  const username = this.request.body.username;
  const password = this.request.body.password;

  try {
    const host = yield _Host2.default.login(username, password);
    this.res.saveCurrentUser(host.object);

    this.body = {
      host: host
    };
  } catch (err) {
    this.body = {
      error: err.message
    };
  }
};

exports.default = router;