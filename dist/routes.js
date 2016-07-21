'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _koaRouter = require('koa-router');

var _koaRouter2 = _interopRequireDefault(_koaRouter);

var _lean = require('./libs/lean');

var _lean2 = _interopRequireDefault(_lean);

var _duels = require('./controllers/duels');

var _duels2 = _interopRequireDefault(_duels);

var _hosts = require('./controllers/hosts');

var _hosts2 = _interopRequireDefault(_hosts);

var _players = require('./controllers/players');

var _players2 = _interopRequireDefault(_players);

var _Duel = require('./models/Duel');

var _Duel2 = _interopRequireDefault(_Duel);

var _Message = require('./models/Message');

var _Message2 = _interopRequireDefault(_Message);

var _Host = require('./models/Host');

var _Host2 = _interopRequireDefault(_Host);

var _Player = require('./models/Player');

var _Player2 = _interopRequireDefault(_Player);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (peerServer, websocketServer) => {

  const app = (0, _koaRouter2.default)();

  const DuelsRouter = (0, _duels2.default)(peerServer, websocketServer);

  // Duels
  app.get('/api/duels', DuelsRouter.get.fetchAllDuels);
  app.get('/api/duels/notyet', DuelsRouter.get.fetchDuelsNotYet);
  app.get('/api/duels/playing', DuelsRouter.get.fetchDuelsPlaying);
  app.get('/api/duels/ended', DuelsRouter.get.fetchDuelsEnded);
  app.get('/api/duel/:id', DuelsRouter.get.fetchDuel);
  app.get('/api/duel/:id/messages', DuelsRouter.get.fetchDuelMessages);
  app.get('/api/duel/:id/nearest', DuelsRouter.get.fetchNearestPeer);
  app.post('/api/duels/new', DuelsRouter.post.newDuel);
  app.post('/api/duel/:id/status', DuelsRouter.post.updateDuelStatus);
  app.post('/api/duel/:id/message', DuelsRouter.post.postMessage);

  // Host
  app.post('/api/host/login', _hosts2.default.post.login);
  app.get('/api/host/islogined', _hosts2.default.get.checkIsLogined);

  // Player
  app.get('/api/players', _players2.default.get.fetchAllPlayers);
  app.post('/api/players/new', _players2.default.post.createNewPlayer);

  return app;
};