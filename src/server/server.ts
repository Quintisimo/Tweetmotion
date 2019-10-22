import { join } from 'path'
import Koa from 'koa'
import Router from 'koa-router'
import serve from 'koa-static'

const app = new Koa()
const router = new Router()

const search = require('./routes/search')

router.use('/api', search.routes())

app.use(router.routes()).use(router.allowedMethods())

if (process.env.NODE_ENV === 'production') {
  app.use(serve(join(__dirname, '../client-build')))
}

app.listen(5000)
