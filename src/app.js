import http from 'http'
import koa from 'koa'
import mount from 'koa-mount'
import etag from 'koa-etag'
import conditional from 'koa-conditional-get'
import connect from 'koa-connect'
import staticServe from 'koa-static'
import bodyParser from 'koa-bodyparser'
import path from 'path'

import AV from './libs/lean'

import { PeerServer } from './libs/peer'
import { WSServer as WebSocketServer } from './libs/ws'
import routes from './routes'

const server = http.createServer()
const app = koa()

const wss = WebSocketServer(server)
const peerServer = PeerServer(server)

app.use(mount('/peer', connect(peerServer)))
app.use(connect(AV.express()))
app.use(bodyParser())
app.use(etag())
app.use(conditional())
app.use(connect(AV.Cloud.CookieSession({ secret: 'duel-living', maxAge: 3600000, fetchUser: true })))
app.use(staticServe(path.join(__dirname, '../assets'), {
  maxAge: 24 * 60 * 60
}))
const router = routes(peerServer, wss)
app.use(router.routes())
app.use(router.allowedMethods())

server.on('request', app.callback()).listen(process.env.LEANCLOUD_APP_PORT, () => {
  console.log('Duel-Living is running')
})