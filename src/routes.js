import Router from 'koa-router'

import AV from './libs/lean'

import Duels from './controllers/duels'
import HostsRouter from './controllers/hosts'
import PlayersRouter from './controllers/players'

import Duel from './models/Duel'
import Message from './models/Message'
import Host from './models/Host'
import Player from './models/Player'

export default (peerServer, websocketServer) => {

  const app = Router()

  const DuelsRouter = Duels(peerServer, websocketServer)

  // Duels
  app.get('/api/duels', DuelsRouter.get.fetchAllDuels)
  app.get('/api/duels/notyet', DuelsRouter.get.fetchDuelsNotYet)
  app.get('/api/duels/playing', DuelsRouter.get.fetchDuelsPlaying)
  app.get('/api/duels/ended', DuelsRouter.get.fetchDuelsEnded)
  app.get('/api/duel/:id', DuelsRouter.get.fetchDuel)
  app.get('/api/duel/:id/messages', DuelsRouter.get.fetchDuelMessages)
  app.get('/api/duel/:id/nearest', DuelsRouter.get.fetchNearestPeer)
  app.post('/api/duels/new', DuelsRouter.post.newDuel)
  app.post('/api/duel/:id/status', DuelsRouter.post.updateDuelStatus)
  app.post('/api/duel/:id/message', DuelsRouter.post.postMessage)

  // Host
  app.post('/api/host/login', HostsRouter.post.login)
  app.get('/api/host/islogined', HostsRouter.get.checkIsLogined)

  // Player
  app.get('/api/players', PlayersRouter.get.fetchAllPlayers)
  app.post('/api/players/new', PlayersRouter.post.createNewPlayer)

  return app
}