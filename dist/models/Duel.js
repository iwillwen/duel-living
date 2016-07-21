'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _lean = require('../libs/lean');

var _lean2 = _interopRequireDefault(_lean);

var _events = require('events');

var _Host = require('./Host');

var _Host2 = _interopRequireDefault(_Host);

var _Player = require('./Player');

var _Player2 = _interopRequireDefault(_Player);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DuelObject = _lean2.default.Object.extend('Duel');

class Duel extends _events.EventEmitter {
  constructor() {
    let players = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
    let scores = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    let hosts = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
    let status = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];
    let save = arguments.length <= 4 || arguments[4] === undefined ? true : arguments[4];

    super();

    this.players = players;
    this.scores = scoresc;
    this.hosts = hosts;
    this.status = status;
    // Status: 0 - not yet, 1 - playing, 2 - ended

    if (save) {
      const duelObject = new DuelObject();
      duelObject.set('scores', scores);
      duelObject.set('status', status);

      const playersRelation = duelObject.relation('players');
      for (const player of players) playersRelation.add(player.object);

      const hostsRelation = duelObject.relation('hosts');
      for (const host of hosts) hostsRelation.add(host.object);

      duelObject.save().then(duel => {
        this.object = duel;
        this.id = duel.id;
        this.emit('ready');
      }).catch(err => this.emit('error', err));
    }
  }

  updateScores(scores) {
    this.object.set('scores', scores);
    return this.object.save();
  }

  updateStatus(status) {
    this.object.set('status', status);
    return this.object.save();
  }

  plain() {
    return {
      id: this.id,
      players: this.players.map(player => player.plain()),
      scores: this.scores,
      hosts: this.hosts.map(host => host.plain()),
      status: this.status
    };
  }

  static fetch(id) {
    const query = new _lean2.default.Query(DuelObject);
    return new Promise((resolve, reject) => {
      query.get(id).then(object => Duel.wrap(object)).then(resolve).catch(reject);
    });
  }

  static fetchAllDuels() {
    const query = new _lean2.default.Query(DuelObject);
    return new Promise((resolve, reject) => {
      query.find().then(results => results.map(Duel.wrap)).then(promises => Promise.all(promises)).then(resolve).catch(reject);
    });
  }

  static fetchDuelsNotYet() {
    const query = new _lean2.default.Query(DuelObject);
    query.equalTo('status', 0);

    return new Promise((resolve, reject) => {
      query.find().then(results => results.map(Duel.wrap)).then(promises => Promise.all(promises)).then(resolve).catch(reject);
    });
  }

  static fetchDuelsPlaying() {
    const query = new _lean2.default.Query(DuelObject);
    query.equalTo('status', 1);
    return new Promise((resolve, reject) => {
      query.find().then(results => results.map(Duel.wrap)).then(promises => Promise.all(promises)).then(resolve).catch(reject);
    });
  }

  static fetchDuelsEnded() {
    const query = new _lean2.default.Query(DuelObject);
    query.equalTo('status', 2);
    return new Promise((resolve, reject) => {
      query.find().then(results => results.map(Duel.wrap)).then(promises => Promise.all(promises)).then(resolve).catch(reject);
    });
  }

  static wrap(object) {
    return new Promise((resolve, reject) => {
      Promise.all([object.relation('players').query().find(), object.relation('hosts').query().find()]).then(_ref => {
        var _ref2 = _slicedToArray(_ref, 2);

        let players = _ref2[0];
        let hosts = _ref2[1];

        players = players.map(_Player2.default.wrap);
        hosts = hosts.map(_Host2.default.wrap);

        const scores = object.get('scores');
        const status = object.get('status');

        const duel = new Duel(players, scores, hosts, status, false);
        duel.object = object;
        duel.id = object.id;

        resolve(duel);
      }).catch(reject);
    });
  }
}

exports.default = Duel;