import { promisify } from 'util'
import { join } from 'path'
import Koa from 'koa'
import Router from 'koa-router'
import serve from 'koa-static'
import Twitter from 'twitter'
import { createClient } from 'redis'
import { analyseTweets } from './analysis'
import { TweetAnalysed } from '../interfaces'

const app = new Koa()
const router = new Router()
const twitter = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})
let search = ''

const redis = createClient()
const getCachedTweets: (key: string) => Promise<string> = promisify(
  redis.get
).bind(redis)

redis.on('error', err => console.error('Redis Error', err))

router.get('/api/:search', async ctx => {
  try {
    search = ctx.params.search
    if (search.length) {
      const result = await getCachedTweets(search)
      if (result) {
        ctx.body = result
      } else {
        const res = await twitter.get('search/tweets', { q: search })
        const tweets = analyseTweets(res.statuses)
        redis.setex(search, 3600, JSON.stringify(tweets))
        ctx.body = analyseTweets(res.statuses)
      }
    }
  } catch (error) {
    if (error.code === 88) {
      ctx.body = 'Rate Limit Exceeded'
    }
  }
})

app.use(router.routes()).use(router.allowedMethods())

if (process.env.NODE_ENV === 'production') {
  app.use(serve(join(__dirname, '../client-build')))
}

app.listen(5000)

setInterval(async () => {
  if (search.length) {
    const result = await getCachedTweets(search)
    const res = await twitter.get('search/tweets', { q: search })
    const tweets = analyseTweets(res.statuses)
    const cachedTweets: TweetAnalysed[] = JSON.parse(result || '[]')
    const uninqueTweets = [...cachedTweets, ...tweets].filter(
      (e, i, arr) => i === arr.findIndex(t => t.id === e.id)
    )
    redis.setex(search, 3600, JSON.stringify(uninqueTweets))
  }
}, 10000)
