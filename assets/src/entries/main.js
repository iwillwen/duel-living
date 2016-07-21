import Vue from 'vue'
import VueRouter from 'vue-router'

import App from '../components/App.vue'
import IndexRoute from '../router-components/Index.vue'
import DuelRoute from '../router-components/Duel.vue'

Vue.use(VueRouter)

const router = new VueRouter()

router.map({
  '/': {
    component: IndexRoute
  },

  '/duel/:id': {
    component: DuelRoute
  }
})

router.start(App, '#app')