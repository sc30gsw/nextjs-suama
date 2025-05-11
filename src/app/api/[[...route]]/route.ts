import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import appeals from '~/features/appeals/api/route'
import missions from '~/features/missions/api/route'
import projects from '~/features/projects/api/route'
import dailies from '~/features/reports/daily/api/route'
import troubles from '~/features/troubles/api/route'

export const runtime = 'edge'

const app = new Hono().basePath('/api')

const route = app
  .route('/dailies', dailies)
  .route('/projects', projects)
  .route('/missions', missions)
  .route('/troubles', troubles)
  .route('/appeals', appeals)

export type AppType = typeof route

export const GET = handle(app)
export const POST = handle(app)
