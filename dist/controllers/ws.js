'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ws = require('ws');

const sockets = new Map();
const socketsWM = new WeakMap();
const duels = new Map();

exports.default = server => {
  const wss = new _ws.Server({
    server,
    path: '/direct'
  });

  wss.on('connection', connection);
  wss.boardcast = boardcast;

  return wss;
};

function connection(socket) {
  socket.on('message', msg => handleMessage(msg, socket));
  socket.on('close', () => {
    socket = null;
  });
}

function handleMessage(msg, socket) {
  const data = JSON.parse(msg);

  switch (data.type) {
    // Hand shaking
    case 0:
      sockets.set(data.id, socket);
      socketsWM.set(socket, data.id);

      if (!duels.has(data.duel)) duels.set(data.duel, new Set());

      duels.get(data.duel).add(data.id);
      break;

    // Disconnect
    case 2:
      sockets.delete(data.id);
      socketsWM.delete(socket);

      if (duels.has(data.duel)) {
        duels.get(data.duel).delete(data.id);
      }
      break;
  }
}

function boardcast(data, duelId) {
  if (!duels.has(duelId)) return;

  const socketsIds = duels.get(duelId);

  for (const id of socketsIds) {
    const socket = sockets.get(id);
    socket.send(data);
  }
}