'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lean = require('../libs/lean');

var _lean2 = _interopRequireDefault(_lean);

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Host extends _events.EventEmitter {
  constructor() {
    let username = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    let nickname = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
    let password = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

    super();

    this.username = username;
    this.nickname = nickname;

    if (password) {
      const host = new _lean2.default.User();
      host.setUsername(username);
      host.setPassword(password);
      host.set('nickname', nickname);
      host.signUp().then(loginedHost => {
        this.object = loginedHost;
        this.emit('ready');
      }).catch(err => this.emit('error', err));
    }
  }

  plain() {
    return {
      username: this.username,
      nickname: this.nickname
    };
  }

  static login() {
    let username = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    let password = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

    return new Promise((resolve, reject) => {
      _lean2.default.User.logIn(username, password).then(loginedHost => {
        const host = new Host(username, loginedHost.get('nickname'));
        host.object = loginedHost;
        resolve(host);
      }).catch(reject);
    });
  }

  static wrap(object) {
    const username = object.get('username');
    const nickname = object.get('nickname');

    const player = new Host(username, nickname);
    player.id = object.id;
    player.object = object;
    return player;
  }
}

exports.default = Host;