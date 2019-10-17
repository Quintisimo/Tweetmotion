import { join } from 'path'
import Koa from 'koa'
import Router from 'koa-router'
import serve from 'koa-static'
import Twitter from 'twitter'

const app = new Koa()
const router = new Router()
const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

router.get('/api/:search', async ctx => {
  const search = ctx.params.search
  const res = await client.get('search/tweets', { q: search })
  ctx.body = res
})

app.use(router.routes()).use(router.allowedMethods())

if (process.env.NODE_ENV === 'production') {
  app.use(serve(join(__dirname, '../client-build')))
}

app.listen(5000)
