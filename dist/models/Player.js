'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lean = require('../libs/lean');

var _lean2 = _interopRequireDefault(_lean);

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const PlayerObject = _lean2.default.Object.extend('Player');

class Player extends _events.EventEmitter {
  constructor() {
    let title = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    let save = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

    super();

    this.title = title;

    if (save) {
      const playerObject = new PlayerObject();
      playerObject.set('title', title);
      playerObject.save().then(player => {
        this.object = player;
        this.id = player.id;
        this.emit('ready');
      }).catch(err => this.emit('error', err));
    }
  }

  plain() {
    return {
      id: this.id,
      title: this.title
    };
  }

  static fetch(id) {
    return new Promise((resolve, reject) => {
      const query = new _lean2.default.Query(PlayerObject);
      query.get(id).then(object => resolve(Player.wrap(object))).catch(reject);
    });
  }

  static fetchAllPlayers() {
    const query = new _lean2.default.Query(PlayerObject);

    return query.find().then(results => results.map(Player.wrap));
  }

  static wrap(object) {
    const player = new Player(object.get('title'), false);
    player.id = object.id;
    player.object = object;
    return player;
  }
}

exports.default = Player;