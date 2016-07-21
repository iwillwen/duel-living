'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _lean = require('../libs/lean');

var _lean2 = _interopRequireDefault(_lean);

var _events = require('events');

var _Duel = require('./Duel');

var _Duel2 = _interopRequireDefault(_Duel);

var _Host = require('./Host');

var _Host2 = _interopRequireDefault(_Host);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const MessageObject = _lean2.default.Object.extend('Message');

const emitter = new _events.EventEmitter();

class Message extends _events.EventEmitter {
  constructor() {
    let duel = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
    let content = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
    let scores = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
    let host = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
    let save = arguments.length <= 4 || arguments[4] === undefined ? true : arguments[4];

    super();

    this.duel = duel;
    this.content = content;
    this.scores = scores;
    this.host = host;

    if (save) {
      const messageObject = new MessageObject();
      messageObject.set('duel', duel.object);
      messageObject.set('content', content);
      messageObject.set('scores', scores);
      messageObject.set('host', host.object);

      messageObject.save().then(message => {
        this.object = message;
        this.id = message.id;
        this.emit('ready');
        emitter.emit('message', this);
      }).catch(err => this.emit('error', err));
    }
  }

  plain() {
    return {
      id: this.id,
      duel: this.duel.plain(),
      content: this.content,
      scores: this.scores,
      host: this.host.plain()
    };
  }

  static fetchMessagesByDuel(duel, count) {
    const query = new _lean2.default.Query(MessageObject);

    query.equalTo('duel', duel.object);
    query.descending('createdAt');
    query.limit(count);

    return query.find().then(objects => objects.map(Message.wrap)).then(promises => Promise.all(promises));
  }

  static wrap(object) {
    return new Promise((resolve, reject) => {
      Promise.all([new _lean2.default.Query('Duel').get(object.get('duel').id), new _lean2.default.Query('_User').get(object.get('host').id)]).then(_ref => {
        var _ref2 = _slicedToArray(_ref, 2);

        let duel = _ref2[0];
        let host = _ref2[1];
        return Promise.all([_Duel2.default.wrap(duel), _Host2.default.wrap(host)]);
      }).then(_ref3 => {
        var _ref4 = _slicedToArray(_ref3, 2);

        let duel = _ref4[0];
        let host = _ref4[1];

        const content = object.get('content');
        const scores = object.get('scores');

        const message = new Message(duel, content, scores, host, false);
        message.id = object.id;
        resolve(message);
      }).catch(err => {
        console.error(err);
        reject(err);
      });
    });
  }

  static onNewMessage(callback) {
    emitter.on('message', callback);
  }
}

exports.default = Message;


process.stdin.resume();
process.stdin.on('data', msg => {
  _Duel2.default.fetchAllDuels().then(duels => {
    const duel = duels[0];

    const message = new Message(duel, msg.toString(), duel.scores, duel.hosts[0]);
  });
});