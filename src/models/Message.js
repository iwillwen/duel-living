import AV from '../libs/lean'
import { EventEmitter } from 'events'

import Duel from './Duel'
import Host from './Host'

const MessageObject = AV.Object.extend('Message')

const emitter = new EventEmitter()

class Message extends EventEmitter {
  constructor(duel = null, content = '', scores = {}, host = {}, save = true) {
    super()

    this.duel = duel
    this.content = content
    this.scores = scores
    this.host = host

    if (save) {
      const messageObject = new MessageObject()
      messageObject.set('duel', duel.object)
      messageObject.set('content', content)
      messageObject.set('scores', scores)
      messageObject.set('host', host.object)

      messageObject.save()
        .then(message => {
          this.object = message
          this.id = message.id
          this.emit('ready')
          emitter.emit('message', this)
        })
        .catch(err => this.emit('error', err))
    }
  }

  plain() {
    return {
      id: this.id,
      duel: this.duel.plain(),
      content: this.content,
      scores: this.scores,
      host: this.host.plain()
    }
  }

  static fetchMessagesByDuel(duel, count) {
    const query = new AV.Query(MessageObject)

    query.equalTo('duel', duel.object)
    query.descending('createdAt')
    query.limit(count)

    return query.find()
      .then(objects => objects.map(Message.wrap))
      .then(promises => Promise.all(promises))
  }

  static wrap(object) {
    return new Promise((resolve, reject) => {
      Promise.all([
        (new AV.Query('Duel')).get(object.get('duel').id),
        (new AV.Query('_User')).get(object.get('host').id)
      ])
        .then(([ duel, host ]) => Promise.all([
          Duel.wrap(duel),
          Host.wrap(host)
        ]))
        .then(([ duel, host ]) => {
          const content = object.get('content')
          const scores = object.get('scores')

          const message = new Message(duel, content, scores, host, false)
          message.id = object.id
          resolve(message)
        })
        .catch(err => {
          console.error(err)
          reject(err)
        })
    })
  }

  static onNewMessage(callback) {
    emitter.on('message', callback)
  }
}

export default Message

process.stdin.resume()
process.stdin.on('data', msg => {
  Duel.fetchAllDuels()
    .then(duels => {
      const duel = duels[0]

      const message = new Message(duel, msg.toString(), duel.scores, duel.hosts[0])
    })
})