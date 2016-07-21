'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Duel = require('../models/Duel');

var _Duel2 = _interopRequireDefault(_Duel);

var _Player = require('../models/Player');

var _Player2 = _interopRequireDefault(_Player);

var _Message = require('../models/Message');

var _Message2 = _interopRequireDefault(_Message);

var _Host = require('../models/Host');

var _Host2 = _interopRequireDefault(_Host);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = {
  get: {},
  post: {}
};

let peerServer = null;
let websocketServer = null;

router.get.fetchAllDuels = function* () {
  const duels = yield _Duel2.default.fetchAllDuels();

  this.body = {
    duels: duels.map(duel => duel.plain())
  };
};

router.get.fetchDuelsNotYet = function* () {
  const duels = yield _Duel2.default.fetchDuelsNotYet();

  this.body = {
    duels: duels.map(duel => duel.plain())
  };
};

router.get.fetchDuelsPlaying = function* () {
  const duels = yield _Duel2.default.fetchDuelsPlaying();

  this.body = {
    duels: duels.map(duel => duel.plain())
  };
};

router.get.fetchDuelsEnded = function* () {
  const duels = yield _Duel2.default.fetchDuelsEnded();

  this.body = {
    duels: duels.map(duel => duel.plain())
  };
};

router.get.fetchDuel = function* () {
  const duel = yield _Duel2.default.fetch(this.params.id);
  const messages = yield _Message2.default.fetchMessagesByDuel(duel, 20);

  this.body = {
    duel: duel.plain(),
    messages: messages.map(message => message.plain()),
    directly: websocketServer.isAvailable()
  };
};

router.get.fetchDuelMessages = function* () {
  const count = parseInt(this.query.count) || 20;

  const duel = yield _Duel2.default.fetch(this.params.id);
  const messages = yield _Message2.default.fetchMessagesByDuel(duel, count);

  this.body = {
    messages: messages.map(message => message.plain())
  };
};

router.get.fetchNearestPeer = function* () {
  const id = this.params.id;
  const peerId = this.query.id;

  const nearestId = yield peerServer.fetchNearestId(peerId, id);

  this.body = {
    id: nearestId
  };
};

router.post.newDuel = function* () {
  if (!this.req.currentUser) return this.body = {
    error: 'not logined'
  };

  const playersId = this.request.body.players;

  const players = yield Promise.all(playersId.map(id => _Player2.default.fetch(id)));

  const duel = new _Duel2.default(players, { [playersId[0]]: 0, [playersId[1]]: 0 }, [_Host2.default.wrap(this.req.currentUser)]);

  yield new Promise(resolve => duel.once('ready', resolve));

  this.body = {
    duel: duel.plain()
  };
};

router.post.updateDuelStatus = function* () {
  if (!this.req.currentUser) return this.body = {
    error: 'not logined'
  };

  const duel = yield _Duel2.default.fetch(this.params.id);
  yield duel.updateStatus(parseInt(this.request.body.status));

  this.body = {
    status: parseInt(this.request.body.status)
  };
};

router.post.postMessage = function* () {
  const content = this.request.body.content;
  const host = _Host2.default.wrap(this.req.currentUser);
  const duel = yield _Duel2.default.fetch(this.params.id);
  const scores = this.request.body.scores;

  yield duel.updateScores(scores);

  const message = new _Message2.default(duel, content, scores, host);

  this.body = {
    message: message.plain()
  };
};

exports.default = (_peerServer, _websocketServer) => {
  peerServer = _peerServer;
  websocketServer = _websocketServer;

  _Message2.default.onNewMessage(message => {
    websocketServer.boardcast(JSON.stringify({
      type: 1,
      message: message
    }), message.duel.id);
  });

  return router;
};