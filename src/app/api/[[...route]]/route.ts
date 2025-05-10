import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import missions from '~/features/missions/api/route'
import projects from '~/features/projects/api/route'

export const runtime = 'edge'

const app = new Hono().basePath('/api')

const route = app.route('/projects', projects).route('/missions', missions)

export type AppType = typeof route

export const GET = handle(app)
export const POST = handle(app)
