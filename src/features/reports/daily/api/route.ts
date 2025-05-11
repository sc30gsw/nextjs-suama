import { Hono } from 'hono'
import { upfetchForDummy } from '~/lib/fetcher'
import { sessionMiddleware } from '~/lib/session-middleware'

const app = new Hono().get('/today', sessionMiddleware, async (c) => {
  const { limit, skip } = c.req.query()

  type Response = {
    users: {
      id: number
      firstName: string
      lastName: string
      age: number
      phone: string
      email: string
      username: string
      gender: string
      birthdate: string
    }[]
    total: number
    skip: number
    limit: number
  }

  const userList = await upfetchForDummy<Response>('/users', {
    params: {
      select: 'firstName,lastName,age,phone,email,username,gender,birthdate',
      limit: limit ?? 10,
      skip: skip ?? 0,
    },
  })

  return c.json(userList, 200)
})

export default app
