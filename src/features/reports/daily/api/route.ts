import { Hono } from 'hono'
import { filter } from 'remeda'
import { upfetchForDummy } from '~/lib/fetcher'
import { sessionMiddleware } from '~/lib/session-middleware'

const MAX_LIMIT = 500

// TODO: 実際の本日の日報を取得して、フィルターすること
const app = new Hono()
  .get('/today', sessionMiddleware, async (c) => {
    const { skip, limit, userNames } = c.req.query()

    const skipNumber = Number(skip) || 0
    const limitNumber = Number(limit) || 10

    const userNamesArray = userNames
      ? userNames.split(',').map((name) => name.trim())
      : []

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
      userNamesArray.length > 0
        ? filter(userList.users, (user) =>
            userNamesArray.some((name) => user.username.includes(name)),
          )
        : userList.users

    const paginatedUsers = userList.users.slice(
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
  .get('/mine', sessionMiddleware, async (c) => {
    // TODO: userId・startDate・endDateで日報を検索
    const { skip, limit, startDate, endDate } = c.req.query()
    const userId = c.get('user').id

    const skipNumber = Number(skip) || 0
    const limitNumber = Number(limit) || 10

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

    const paginatedUsers = userList.users.slice(
      skipNumber,
      skipNumber + limitNumber,
    )

    return c.json(
      {
        users: paginatedUsers,
        total: userList.total,
        skip: skipNumber,
        limit: limitNumber,
        startDate,
        endDate,
        userId,
      },
      200,
    )
  })

export default app
