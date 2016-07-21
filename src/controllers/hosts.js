import Host from '../models/Host'

const router = {
  get: {},
  post: {}
}

router.get.checkIsLogined = function*() {
  this.body = {
    logined: !!this.req.currentUser
  }
}

router.post.login = function*() {
  const username = this.request.body.username
  const password = this.request.body.password

  try {
    const host = yield Host.login(username, password)
    this.res.saveCurrentUser(host.object)

    this.body = {
      host: host
    }
  } catch(err) {
    this.body = {
      error: err.message
    }
  }
}

export default router