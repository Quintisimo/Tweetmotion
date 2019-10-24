import { join } from 'path'
import Koa from 'koa'
import serve from 'koa-static'
import { router } from './routes/search'

const app = new Koa()

router.use('/api', router.routes())

app.use(router.routes()).use(router.allowedMethods())

if (process.env.NODE_ENV === 'production') {
  app.use(serve(join(__dirname, '../client-build')))
}

app.listen(5000)
