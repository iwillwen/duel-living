'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.proto = undefined;
exports.PeerServer = PeerServer;

var _peer = require('peer');

var _lodash = require('lodash');

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const connectingIds = new Set();
const regionMaps = new Map();
const ids = new Map();

function parseIP(ip) {
  if (ip === '::1') ip = '119.29.29.29';
  return (0, _nodeFetch2.default)(`http://ip.taobao.com/service/getIpInfo.php?ip=${ ip }`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(res => res.json()).then(info => ({
    country: info.country,
    province: info.region,
    city: info.city
  }));
}

function connection(id) {
  connectingIds.add(id);

  const ip = this.fetchIP(id);
  const duelId = this.fetchDuelID(id);

  ids.set(id, {
    ip: ip,
    token: duelId
  });

  parseIP(ip).then(region => {
    const keys = {
      level1: `${ duelId }:${ region.country }`,
      level2: `${ duelId }:${ region.country }:${ region.province }`,
      level3: `${ duelId }:${ region.country }:${ region.province }:${ region.city }`
    };

    if (!regionMaps.has(keys.level1)) regionMaps.set(keys.level1, new Set());
    if (!regionMaps.has(keys.level2)) regionMaps.set(keys.level2, new Set());
    if (!regionMaps.has(keys.level3)) regionMaps.set(keys.level3, new Set());

    regionMaps.get(keys.level1).add(id);
    regionMaps.get(keys.level2).add(id);
    regionMaps.get(keys.level3).add(id);
  });
}

function disconnect(id) {
  connectingIds.delete(id);

  const ip = this.fetchIP(id);
  const duelId = this.fetchDuelID(id);

  ids.delete(id);

  parseIP(ip).then(region => {

    const keys = {
      level1: `${ duelId }:${ region.country }`,
      level2: `${ duelId }:${ region.country }:${ region.province }`,
      level3: `${ duelId }:${ region.country }:${ region.province }:${ region.city }`
    };

    regionMaps.get(keys.level1).delete(id);
    regionMaps.get(keys.level2).delete(id);
    regionMaps.get(keys.level3).delete(id);
  });
}

function fetchNearestId(id, duelId) {
  const ip = this.fetchIP(id);

  return new Promise((resolve, reject) => {
    parseIP(ip).then(region => {
      const keys = {
        level1: `${ duelId }:${ region.country }`,
        level2: `${ duelId }:${ region.country }:${ region.province }`,
        level3: `${ duelId }:${ region.country }:${ region.province }:${ region.city }`
      };

      if (regionMaps.has(keys.level3)) return resolve(randomElement(regionMaps.get(keys.level3)));
      if (regionMaps.has(keys.level2)) return resolve(randomElement(regionMaps.get(keys.level2)));
      if (regionMaps.has(keys.level1)) return resolve(randomElement(regionMaps.get(keys.level1)));
    }).catch(reject);
  });
}

function fetchIP(id) {
  let ip = '119.29.29.29';
  if (this._clients.peerjs[id]) {
    ip = this._clients.peerjs[id].ip;
  } else if (ids.has(id)) {
    ip = ids.get(id).ip;
  } else {}
  return ip;
}

function fetchDuelID(id) {
  return this._clients.peerjs[id] ? this._clients.peerjs[id].token : ids.get(id).token;
}

const proto = exports.proto = {
  connection,
  disconnect,
  fetchNearestId,
  fetchIP,
  fetchDuelID
};

function PeerServer(server) {
  const peerServer = (0, _peer.ExpressPeerServer)(server, {
    debug: false
  });

  peerServer.mountpath = '/peer';
  peerServer.emit('mount', { settings: {} });

  peerServer.on('connection', id => peerServer.connection(id)).on('disconnect', id => peerServer.disconnect(id));

  return (0, _lodash.merge)(peerServer, proto);
}

function randomElement(set) {
  const size = set.size;
  const pivot = Math.round(Math.random() * (size - 1));
  let rtnEl = null;
  let n = -1;

  set.forEach(el => {
    if (n === pivot) return;
    n++;
    if (n === pivot) rtnEl = el;
  });

  return rtnEl;
}