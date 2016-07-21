import AV from '../libs/lean'
import { EventEmitter } from 'events'

class Host extends EventEmitter {
  constructor(username = '', nickname = '', password = null) {
    super()

    this.username = username
    this.nickname = nickname

    if (password) {
      const host = new AV.User()
      host.setUsername(username)
      host.setPassword(password)
      host.set('nickname', nickname)
      host.signUp()
        .then(loginedHost => {
          this.object = loginedHost
          this.emit('ready')
        })
        .catch(err => this.emit('error', err))
    }
  }

  plain() {
    return {
      username: this.username,
      nickname: this.nickname
    }
  }

  static login(username = '', password = '') {
    return new Promise((resolve, reject) => {
      AV.User.logIn(username, password)
        .then(loginedHost => {
          const host = new Host(username, loginedHost.get('nickname'))
          host.object = loginedHost
          resolve(host)
        })
        .catch(reject)
    })
  }

  static wrap(object) {
    const username = object.get('username')
    const nickname = object.get('nickname')

    const player = new Host(username, nickname)
    player.id = object.id
    player.object = object
    return player
  }
}

export default Host