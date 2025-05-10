import { Hono } from 'hono'
import { upfetchForDummy } from '~/lib/fetcher'
import { sessionMiddleware } from '~/lib/session-middleware'

const app = new Hono().get('/', sessionMiddleware, async (c) => {
  type Response = {
    posts: {
      id: number
      title: string
      body: string
      tags: string[]
      reactions: Record<'likes' | 'dislikes', number>
      views: number
      userId: number
    }[]
    total: number
    skip: number
    limit: number
  }

  const res = await upfetchForDummy<Response>('/posts')

  return c.json(res)
})

export default app
