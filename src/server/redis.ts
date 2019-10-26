import { promisify } from 'util'
import { createClient } from 'redis'

const redis = createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: 6379
})

redis.on('error', err => console.error('Redis Error', err))

export const getCachedTweets: (key: string) => Promise<string> = promisify(
  redis.get
).bind(redis)

export const setCachedTweets: (
  key: string,
  value: string
) => Promise<void> = promisify(redis.set).bind(redis)
