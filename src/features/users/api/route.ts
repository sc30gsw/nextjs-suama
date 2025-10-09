import { count, like, or } from 'drizzle-orm'
import { Hono } from 'hono'
import { MAX_LIMIT } from '~/constants'
import { ERROR_STATUS } from '~/constants/error-message'
import { users } from '~/db/schema'
import { db } from '~/index'
import { sessionMiddleware } from '~/lib/session-middleware'

const app = new Hono().get('/', sessionMiddleware, async (c) => {
  const { skip, limit, userNames } = c.req.query()

  const skipNumber = Number(skip) || 0
  const limitNumber = Number(limit) || MAX_LIMIT

  const userNamesArray = userNames ? userNames.split(',').map((name) => name.trim()) : []

  try {
    const whereClause =
      userNamesArray.length > 0
        ? or(...userNamesArray.flatMap((word) => [like(users.name, `%${word}%`)]))
        : undefined

    const userList = await db.query.users.findMany({
      where: whereClause,
      offset: skipNumber,
      limit: limitNumber,
      orderBy: (users, { asc }) => [asc(users.createdAt)],
    })

    const total = await db.select({ count: count() }).from(users).where(whereClause)

    return c.json(
      {
        users: userList,
        total: total[0].count,
        skip: skipNumber,
        limit: limitNumber,
      },
      200,
    )
  } catch (_) {
    return c.json(
      {
        error: ERROR_STATUS.SOMETHING_WENT_WRONG,
      },
      500,
    )
  }
})

export default app
