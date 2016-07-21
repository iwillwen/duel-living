'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Player = require('../models/Player');

var _Player2 = _interopRequireDefault(_Player);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = {
  get: {},
  post: {}
};

router.get.fetchAllPlayers = function* () {
  const players = yield _Player2.default.fetchAllPlayers();

  this.body = {
    players: players.map(player => player.plain())
  };
};

router.post.createNewPlayer = function* () {
  if (!req.currentUser) return this.body = {
    error: 'not logined'
  };

  const title = this.request.body.title;
  const player = new _Player2.default(title);

  this.body = {
    player: player.plain()
  };
};

exports.default = router;