import { Hono } from 'hono'
import { handle } from 'hono/vercel'

export const runtime = 'edge'

const app = new Hono().basePath('/api')

const route = app.route(
  '/foo',
  app.get((c) => c.text('Hello World!')),
)

export type AppType = typeof route

export const GET = handle(app)
export const POST = handle(app)
