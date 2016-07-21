<template>
  <div id="duel">
    <h2 id="main-title">{{title}}</h2>

    <div class="section">
      <div class="player" v-for="(i, player) in duel.players" :class="playerClass(i)">
        <span class="player-title">{{player.title}}</span>

        <h1 class="score">{{score(player.id)}}</h1>
      </div>
    </div>

    <div class="section">
      <ul id="messages">
        <li class="message" v-for="message in messages">[{{message.host.nickname}}]: {{message.content}} ({{message.scores[duel.players[0].id]}} - {{message.scores[duel.players[1].id]}})</li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'DuelPage',

    data() {
      return {
        duel: {
          players: []
        },
        messages: [],
        messagesIds: new Set(),
        peer: null,
        peerConns: new Set()
      }
    },

    computed: {
      title() {
        if (!this.duel.players.length) return ''

        return `${this.duel.players[0].title} VS ${this.duel.players[1].title}`
      }
    },

    ready() {
      const duelId = this.$route.params.id

      fetch(`/api/duel/${duelId}`)
        .then(res => res.json())
        .then(data => {
          this.duel = data.duel
          this.messages = this.messages.concat(data.messages)

          for (const message of data.messages) {
            this.messagesIds.add(message.id)
          }

          this.setupPeer()

          if (data.directly) {
            this.connectToServer()
          } else {
            this.connectToPeer()
          }
        })
    },

    methods: {
      playerClass(i) {
        switch (i) {
          case 0:
            return { 'player-blue': true }
          case 1:
            return { 'player-red': true }
        }
      },

      score(id) {
        return this.duel.scores[id] || 0
      },

      setupPeer() {
        const id = Math.random().toString(32).substr(2)
        this.peer = new Peer(id, {
          path: `/peer`,
          host: location.hostname,
          port: parseInt(location.port || '80'),
          token: this.$route.params.id
        })
        this.peer.id = id

        this.peer
          .on('connection', conn => {
            this.peerConns.add(conn)
            conn.on('data', data => this.handleMessage(JSON.parse(data)))

            conn.on('close', () => {
              this.peerConns.delete(conn)
            })
          })
      },

      connectToServer() {
        const wsURL = `ws://${location.hostname}${(location.port ? ':' + location.port : '')}/direct`
        const socket = new WebSocket(wsURL)

        socket.onopen = evt => {
          socket.send(JSON.stringify({
            type: 0,
            id: this.peer.id,
            duel: this.$route.params.id
          }))
        }

        socket.onmessage = evt => {
          this.handleMessage(JSON.parse(evt.data))
        }
      },

      connectToPeer() {
        fetch(`/api/duel/${this.$route.params.id}/nearest?id=${this.peer.id}`)
          .then(res => res.json())
          .then(data => {
            const conn = this.peer.connect(data.id)
            conn.on('data', data => this.handleMessage(JSON.parse(data)))
            this.peerConns.add(conn)
          })
      },

      handleMessage(data) {
        switch (data.type) {
          // Message
          case 1:
            if (this.messagesIds.has(data.message.id)) return

            this.messagesIds.add(data.message.id)
            this.messages.unshift(data.message)
            this.duel.scores = data.message.scores

            for (const conn of this.peerConns) {
              conn.send(JSON.stringify(data))
            }

            break
        }
      }
    }
  }
</script>

<style scoped>
  #main-title {
    text-align: center;
  }

  .section {
    width: 98vw;
    margin: 1vw;
    background: #fff;
    box-shadow: 0 1px 1px rgba(0,0,0,.3);
    border-radius: 2px;
    box-sizing: border-box;
    overflow: hidden;
    margin-bottom: .5rem;
  }

  .player {
    width: 49vw;
    float: left;
    margin: 0;
    border: 0;
    padding: 1rem;
    text-align: center;
    color: #FFF;
  }

  .player:first-child {
    border-radius: 2px 0 0 2px;
  }

  .player:last-child {
    border-radius: 0 2px 2px 0;
  }

  .player-red {
    background: #ff4d4d;
  }

  .player-blue {
    background: #3c8fff;
  }

  .score {
    font-size: 3rem;
    margin: 1rem 0 .5rem 0;
  }

  #messages {
    list-style: none;
    padding: 0;
    margin: 10px;
    height: 66vh;
    overflow-y: scroll;
  }

  .message {
    margin-bottom: .4rem;
    font-size: 1.1rem;
  }
</style>