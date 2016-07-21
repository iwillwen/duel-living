'use strict';

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _koaMount = require('koa-mount');

var _koaMount2 = _interopRequireDefault(_koaMount);

var _koaEtag = require('koa-etag');

var _koaEtag2 = _interopRequireDefault(_koaEtag);

var _koaConditionalGet = require('koa-conditional-get');

var _koaConditionalGet2 = _interopRequireDefault(_koaConditionalGet);

var _koaConnect = require('koa-connect');

var _koaConnect2 = _interopRequireDefault(_koaConnect);

var _koaStatic = require('koa-static');

var _koaStatic2 = _interopRequireDefault(_koaStatic);

var _koaBodyparser = require('koa-bodyparser');

var _koaBodyparser2 = _interopRequireDefault(_koaBodyparser);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lean = require('./libs/lean');

var _lean2 = _interopRequireDefault(_lean);

var _peer = require('./libs/peer');

var _ws = require('./libs/ws');

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const server = _http2.default.createServer();
const app = (0, _koa2.default)();

const wss = (0, _ws.WSServer)(server);
const peerServer = (0, _peer.PeerServer)(server);

app.use((0, _koaMount2.default)('/peer', (0, _koaConnect2.default)(peerServer)));
app.use((0, _koaConnect2.default)(_lean2.default.express()));
app.use((0, _koaBodyparser2.default)());
app.use((0, _koaEtag2.default)());
app.use((0, _koaConditionalGet2.default)());
app.use((0, _koaConnect2.default)(_lean2.default.Cloud.CookieSession({ secret: 'duel-living', maxAge: 3600000, fetchUser: true })));
app.use((0, _koaStatic2.default)(_path2.default.join(__dirname, '../assets'), {
  maxAge: 24 * 60 * 60
}));
const router = (0, _routes2.default)(peerServer, wss);
app.use(router.routes());
app.use(router.allowedMethods());

server.on('request', app.callback()).listen(process.env.LEANCLOUD_APP_PORT, () => {
  console.log('Duel-Living is running');
});