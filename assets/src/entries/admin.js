import Vue from 'vue'

const swalp = (...args) => {
  return new Promise(resolve => {
    swal(...args, (...argv) => resolve(...argv))
  })
}

new Vue({
  el: '#admin',

  data: {
    page: 'main',
    host: null,

    duels: [],
    duel: null,
    messages: [],

    content: '',

    players: [],
    newPlayers: {
      1: '',
      2: ''
    },
  },

  ready() {
    fetch('/api/host/islogined', {
      credentials: 'same-origin'
    })
      .then(res => res.json())
      .then(data => {
        if (!data.logined) {
          swalp({
            title: 'Login',
            type: 'input',
            placeholder: 'username',
            closeOnConfirm: false,
            animation: "slide-from-top"
          })
            .then(username => {
              return swalp({
                title: 'Input password',
                type: 'input',
                inputType: 'password',
                closeOnConfirm: false,
                animation: "slide-from-top",
                showLoaderOnConfirm: true
              })
                .then(password => [ username, password ])
            })
            .then(([ username, password ]) => {
              return fetch('/api/host/login', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                  username, password
                })
              })
            })
            .then(res => res.json())
            .then(data => {
              if (data.error) {
                return swalp({
                  type: 'error',
                  title: data.error,
                  showCancelButton: false,
                  showConfirmButton: false
                })
              }

              this.host = data.host

              return swalp({
                type: 'success',
                title: 'Welcome'
              })
            })
        } else {
          return Promise.resolve()
        }
      })
      .then(() => {
        return fetch('/api/duels', {
          credentials: 'same-origin'
        })
      })
      .then(res => res.json())
      .then(data => {
        this.duels = data.duels
      })
  },

  methods: {
    enterDuel(duel) {
      this.page = 'main'
      this.duel = duel

      fetch(`/api/duel/${duel.id}/messages`, {
        credentials: 'same-origin'
      })
        .then(res => res.json())
        .then(data => {
          this.messages = data.messages
        })
    },

    score(id) {
      return this.duel.scores[id] || 0
    },

    duelClass(duel) {
      switch (duel.status) {
        // Not yet
        case 0:
          return {}

        // Playing
        case 1:
          return {
            'list-group-item-success': true
          }

        // Ended
        case 2: {
          return {
            'list-group-item-info': true
          }
        }
      }
    },

    playerClass(i) {
      switch (i) {
        case 0:
          return { 'player-blue': true }
        case 1:
          return { 'player-red': true }
      }
    },

    plusScore(player) {
      this.duel.scores[player.id]++
    },

    minusScore(player) {
      if (this.duel.scores[player.id] === 0) return

      this.duel.scores[player.id]--
    },

    sendMessage() {
      const content = this.content

      fetch(`/api/duel/${this.duel.id}/message`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          content,
          scores: this.duel.scores
        })
      })
        .then(res => res.json())
        .then(data => {
          this.messages.unshift(data.message)
          this.content = ''
        })
    },

    updateDuelStatus(status) {
      fetch(`/api/duel/${this.duel.id}/status`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          status: status
        })
      })
        .then(res => res.json())
        .then(data => {
          this.duel.status = data.status
        })
    },

    newDuel() {
      this.page = 'newduel'

      fetch('/api/players')
        .then(res => res.json())
        .then(data => {
          this.players = data.players
        })
    },

    newPlayer(pos) {
      swalp({
        title: 'Player title',
        type: 'input',
        closeOnConfirm: false,
        animation: "slide-from-top",
        showLoaderOnConfirm: true
      })
        .then(title => {
          if (title === '') {
            return swal({
              title: 'Title couldn\'t be empty.',
              type: 'error'
            })
          }

          fetch('/api/players/new', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify({
              title: title
            })
          })
            .then(res => res.json())
            .then(data => {
              this.players.push(data.player)
              this.newPlayers[pos] = data.player.id

              swal({
                title: 'OK',
                type: 'success'
              })
            })
        })
    },

    submitNewDuel() {
      fetch(`/api/duels/new`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          players: this.newPlayers
        })
      })
        .then(res => res.json())
        .then(data => {
          this.duels.unshift(data.duel)
          this.enterDuel(data.duel)
        })
    }
  }
})