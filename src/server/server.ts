import { join } from 'path'
import Koa from 'koa'
import Router from 'koa-router'
import serve from 'koa-static'
import Twitter from 'twitter'
import { getStoredTweets, setStoredTweets } from './bucket'
import { getCachedTweets, setCachedTweets } from './redis'
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

router.get('/api/initial/:search', async ctx => {
  try {
    const search: string = ctx.params.search
    if (search.length) {
      const cachedTweets = await getCachedTweets(search)

      if (cachedTweets) {
        ctx.body = JSON.parse(cachedTweets)
      } else {
        const storedTweets = await getStoredTweets(search)

        if (storedTweets) {
          ctx.body = JSON.parse(storedTweets)
          await setCachedTweets(search, storedTweets)
        } else {
          const res = await twitter.get('search/tweets', { q: search })
          const tweets = analyseTweets(res.statuses)
          ctx.body = analyseTweets(res.statuses)
          await setStoredTweets(search, JSON.stringify(tweets))
          await setCachedTweets(search, JSON.stringify(tweets))
        }
      }
    }
  } catch (error) {
    if (error.code === 88) {
      ctx.body = 'Rate Limit Exceeded'
    } else {
      ctx.body = []
    }
  }
})

router.get('/api/update/:search', async ctx => {
  try {
    const search: string = ctx.params.search
    if (search.length) {
      const storedReq = await getStoredTweets(search)
      const cachedReq = await getCachedTweets(search)
      const res = await twitter.get('search/tweets', { q: search })
      const tweets = analyseTweets(res.statuses)
      const storedTweets: TweetAnalysed[] = JSON.parse(storedReq || '[]')
      const cachedTweets: TweetAnalysed[] = JSON.parse(cachedReq || '[]')
      const uninqueTweets = [
        ...storedTweets,
        ...cachedTweets,
        ...tweets
      ].filter((e, i, arr) => i === arr.findIndex(t => t.id === e.id))
      await setStoredTweets(search, JSON.stringify(uninqueTweets))
      await setCachedTweets(search, JSON.stringify(uninqueTweets))
      ctx.body = uninqueTweets
    }
  } catch (error) {
    ctx.body = []
  }
})

app.use(router.routes()).use(router.allowedMethods())

if (process.env.NODE_ENV === 'production') {
  app.use(serve(join(__dirname, '../client-build')))
}

app.listen(5000)
