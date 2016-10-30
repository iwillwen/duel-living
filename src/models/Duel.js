import AV from '../libs/lean'
import { EventEmitter } from 'events'

const DuelObject = AV.Object.extend('Duel')

import Host from './Host'
import Player from './Player'

class Duel extends EventEmitter {
  constructor(players = [], scores = {}, hosts = [], status = 0, save = true) {
    super()

    this.players = players
    this.scores = scores
    this.hosts = hosts
    this.status = status
    // Status: 0 - not yet, 1 - playing, 2 - ended

    if (save) {
      const duelObject = new DuelObject()
      duelObject.set('scores', scores)
      duelObject.set('status', status)

      const playersRelation = duelObject.relation('players')
      for (const player of players)
        playersRelation.add(player.object)

      const hostsRelation = duelObject.relation('hosts')
      for (const host of hosts)
        hostsRelation.add(host.object)

      duelObject.save()
        .then(duel => {
          this.object = duel
          this.id = duel.id
          this.emit('ready')
        })
        .catch(err => this.emit('error', err))
    }
  }

  updateScores(scores) {
    this.object.set('scores', scores)
    return this.object.save()
  }

  updateStatus(status) {
    this.object.set('status', status)
    return this.object.save()
  }

  plain() {
    return {
      id: this.id,
      players: this.players.map(player => player.plain()),
      scores: this.scores,
      hosts: this.hosts.map(host => host.plain()),
      status: this.status
    }
  }

  static fetch(id) {
    const query = new AV.Query(DuelObject)
    return new Promise((resolve, reject) => {
      query.get(id)
        .then(object => Duel.wrap(object))
        .then(resolve)
        .catch(reject)
    })
  }

  static fetchAllDuels() {
    const query = new AV.Query(DuelObject)
    return new Promise((resolve, reject) => {
      query.find()
        .then(results => results.map(Duel.wrap))
        .then(promises => Promise.all(promises))
        .then(resolve)
        .catch(reject)
    })
  }

  static fetchDuelsNotYet() {
    const query = new AV.Query(DuelObject)
    query.equalTo('status', 0)

    return new Promise((resolve, reject) => {
      query.find()
        .then(results => results.map(Duel.wrap))
        .then(promises => Promise.all(promises))
        .then(resolve)
        .catch(reject)
    })
  }

  static fetchDuelsPlaying() {
    const query = new AV.Query(DuelObject)
    query.equalTo('status', 1)
    return new Promise((resolve, reject) => {
      query.find()
        .then(results => results.map(Duel.wrap))
        .then(promises => Promise.all(promises))
        .then(resolve)
        .catch(reject)
    })
  }

  static fetchDuelsEnded() {
    const query = new AV.Query(DuelObject)
    query.equalTo('status', 2)
    return new Promise((resolve, reject) => {
      query.find()
        .then(results => results.map(Duel.wrap))
        .then(promises => Promise.all(promises))
        .then(resolve)
        .catch(reject)
    })
  }

  static wrap(object) {
    return new Promise((resolve, reject) => {
      Promise.all([
        object.relation('players').query().find(),
        object.relation('hosts').query().find()
      ])
        .then(([ players, hosts ]) => {
          players = players.map(Player.wrap)
          hosts = hosts.map(Host.wrap)

          const scores = object.get('scores')
          const status = object.get('status')

          const duel = new Duel(players, scores, hosts, status, false)
          duel.object = object
          duel.id = object.id

          resolve(duel)
        })
        .catch(reject)
    })
  }
}

export default Duel
