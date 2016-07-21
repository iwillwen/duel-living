<template>
  <div id="index">
    <h1 id="main-title">Duel Living</h1>

    <h3 class="section-title">All Duels</h3>

    <duels-list :duels="duels"></duels-list>
  </div>
</template>

<script>
  import DuelsList from '../components/DuelsList.vue'

  export default {
    name: 'IndexPage',

    data() {
      return {
        duels: []
      }
    },

    ready() {
      fetch('/api/duels')
        .then(res => res.json())
        .then(data => this.duels = data.duels)
    },

    components: {
      DuelsList
    }
  }
</script>

<style scoped>
  #main-title {
    text-align: center;
  }

  .section-title {
    padding-left: 5px;
    margin-left: 1vw;
    border-left: 5px solid #666;
  }
</style>