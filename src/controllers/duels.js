import Duel from '../models/Duel'
import Player from '../models/Player'
import Message from '../models/Message'
import Host from '../models/Host'

const router = {
  get: {},
  post: {}
}

let peerServer = null
let websocketServer = null

router.get.fetchAllDuels = function*() {
  const duels = yield Duel.fetchAllDuels()

  this.body = {
    duels: duels.map(duel => duel.plain())
  }
}

router.get.fetchDuelsNotYet = function*() {
  const duels = yield Duel.fetchDuelsNotYet()

  this.body = {
    duels: duels.map(duel => duel.plain())
  }
}

router.get.fetchDuelsPlaying = function*() {
  const duels = yield Duel.fetchDuelsPlaying()

  this.body = {
    duels: duels.map(duel => duel.plain())
  }
}

router.get.fetchDuelsEnded = function*() {
  const duels = yield Duel.fetchDuelsEnded()

  this.body = {
    duels: duels.map(duel => duel.plain())
  }
}

router.get.fetchDuel = function*() {
  const duel = yield Duel.fetch(this.params.id)
  const messages = yield Message.fetchMessagesByDuel(duel, 20)

  this.body = {
    duel: duel.plain(),
    messages: messages.map(message => message.plain()),
    directly: websocketServer.isAvailable()
  }
}

router.get.fetchDuelMessages = function*() {
  const count = parseInt(this.query.count) || 20

  const duel = yield Duel.fetch(this.params.id)
  const messages = yield Message.fetchMessagesByDuel(duel, count)

  this.body = {
    messages: messages.map(message => message.plain())
  }
}

router.get.fetchNearestPeer = function*() {
  const id = this.params.id
  const peerId = this.query.id

  const nearestId = yield peerServer.fetchNearestId(peerId, id)

  this.body = {
    id: nearestId
  }
}

router.post.newDuel = function*() {
  if (!this.req.currentUser) return this.body = {
    error: 'not logined'
  }

  const playersId = this.request.body.players

  const players = yield Promise.all(
    playersId.map(id => Player.fetch(id))
  )

  const duel = new Duel(
    players,
    { [playersId[0]]: 0, [playersId[1]]: 0 },
    [ Host.wrap(this.req.currentUser) ]
  )

  yield new Promise(resolve => duel.once('ready', resolve))

  this.body = {
    duel: duel.plain()
  }
}

router.post.updateDuelStatus = function*() {
  if (!this.req.currentUser) return this.body = {
    error: 'not logined'
  }

  const duel = yield Duel.fetch(this.params.id)
  yield duel.updateStatus(parseInt(this.request.body.status))

  this.body = {
    status: parseInt(this.request.body.status)
  }
}

router.post.postMessage = function*() {
  const content = this.request.body.content
  const host = Host.wrap(this.req.currentUser)
  const duel = yield Duel.fetch(this.params.id)
  const scores = this.request.body.scores

  yield duel.updateScores(scores)

  const message = new Message(duel, content, scores, host)

  this.body = {
    message: message.plain()
  }
}

export default (_peerServer, _websocketServer) => {
  peerServer = _peerServer
  websocketServer = _websocketServer

  Message.onNewMessage(message => {
    websocketServer.boardcast(JSON.stringify({
      type: 1,
      message: message
    }), message.duel.id)
  })

  return router
}