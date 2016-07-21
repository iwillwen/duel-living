<template>
  <div id="duels">
    <div
      class="duel"
      v-for="duel in duels"
      v-link="{ path: `/duel/${duel.id}` }"
    >
      <div>
        <span class="player-name">{{duel.players[0].title}}</span> VS <span class="player-name">{{duel.players[1].title}}</span>
      </div>
      <span class="scores-label" v-if="duel.status !== 0">{{scoresText(duel)}}</span>
      <span class="status-label">{{statusText(duel)}}</span>
    </div>
    <p id="loading" v-if="duels.length === 0">Loading...</p>
  </div>
</template>

<script>
  export default {
    props: [ 'duels' ],

    methods: {
      statusText(duel) {
        switch (duel.status) {
          case 0:
            return 'Not start yet'

          case 1:
            return 'Now playing'

          case 2:
          default:
            return 'The duel was ended'
        }
      },

      scoresText(duel) {
        return `${duel.scores[duel.players[0].id]} - ${duel.scores[duel.players[1].id]}`
      }
    }
  }
</script>

<style scoped>
  .duel {
    width: 98vw;
    margin: 1vw;
    padding: 4vw 2vw;
    background: #fff;
    box-shadow: 0 1px 1px rgba(0,0,0,.3);
    border-radius: 2px;
    box-sizing: border-box;
    text-align: center;
  }

  .player-name {
    font-weight: bold;
    font-size: 1.3rem;
  }

  .scores-label {
    font-size: 2rem;
    line-height: 3rem;
  }

  .scores-label, .status-label {
    margin-top: 5px;
    display: block;
  }

  #loading {
    text-align: center;
  }
</style>