import { Hono } from 'hono'
import { filter } from 'remeda'
import { upfetchForDummy } from '~/lib/fetcher'
import { sessionMiddleware } from '~/lib/session-middleware'

const MAX_LIMIT = 500

const app = new Hono().get('/', sessionMiddleware, async (c) => {
  const { skip, limit, names } = c.req.query()

  const skipNumber = Number(skip) || 0
  const limitNumber = Number(limit) || 10

  //  TODO: テーブルのnameとlikeKeywordsを部分一致検索し検索する
  const namesArray = names ? names.split(',').map((name) => name.trim()) : []

  type User = {
    id: number
    firstName: string
    lastName: string
    age: number
    phone: string
    email: string
    username: string
    gender: string
    birthDate: string
    role: 'admin' | 'moderator'
  }

  type Response = {
    users: User[]
    total: number
    skip: number
    limit: number
  }

  const userList = await upfetchForDummy<Response>('/users', {
    params: {
      select:
        'firstName,lastName,age,phone,email,username,gender,birthDate,role',
      limit: MAX_LIMIT,
      skip: 0,
    },
  })

  const filteredUsers =
    namesArray.length > 0
      ? filter(userList.users, (user) =>
          namesArray.some((name) => user.username.includes(name)),
        )
      : userList.users

  const paginatedUsers = filteredUsers.slice(
    skipNumber,
    skipNumber + limitNumber,
  )

  return c.json(
    {
      users: paginatedUsers,
      total: filteredUsers.length,
      skip: skipNumber,
      limit: limitNumber,
    },
    200,
  )
})

export default app
