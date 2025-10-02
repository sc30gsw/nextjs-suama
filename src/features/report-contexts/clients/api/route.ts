import { count, like, or } from 'drizzle-orm'
import { Hono } from 'hono'
import { MAX_LIMIT } from '~/constants'
import { ERROR_STATUS } from '~/constants/error-message'
import { clients } from '~/db/schema'
import { db } from '~/index'
import { sessionMiddleware } from '~/lib/session-middleware'

const app = new Hono().get('/', sessionMiddleware, async (c) => {
  const { skip, limit, names } = c.req.query()

  const skipNumber = Number(skip) || 0
  const limitNumber = Number(limit) || MAX_LIMIT

  const namesArray = names ? names.split(',').map((name) => name.trim()) : []

  try {
    const whereClause =
      namesArray.length > 0
        ? or(
            ...namesArray.flatMap((word) => [
              like(clients.name, `%${word}%`),
              like(clients.likeKeywords, `%${word}%`),
            ]),
          )
        : undefined

    const clientList = await db.query.clients.findMany({
      where: whereClause,
      offset: skipNumber,
      limit: limitNumber,
      orderBy: (clients, { asc }) => [asc(clients.createdAt)],
    })

    const total = await db.select({ count: count() }).from(clients).where(whereClause)

    return c.json(
      {
        clients: clientList,
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
