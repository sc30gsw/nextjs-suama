import { count, eq, like, or } from 'drizzle-orm'
import { Hono } from 'hono'
import { MAX_LIMIT } from '~/constants'
import { ERROR_STATUS } from '~/constants/error-message'
import { categoryOfTroubles, troubles } from '~/db/schema'
import { db } from '~/index'
import { sessionMiddleware } from '~/lib/session-middleware'

const app = new Hono()
  .get('/', sessionMiddleware, async (c) => {
    try {
      const unresolvedTroubles = await db.query.troubles.findMany({
        columns: {
          id: true,
          categoryOfTroubleId: true,
          trouble: true,
          resolved: true,
        },
        where: eq(troubles.resolved, false),
        orderBy: (troubles, { desc }) => [desc(troubles.createdAt)],
      })

      return c.json(unresolvedTroubles, 200)
    } catch (_) {
      return c.json(
        {
          error: ERROR_STATUS.SOMETHING_WENT_WRONG,
        },
        500,
      )
    }
  })
  .get('/categories', sessionMiddleware, async (c) => {
    const { skip, limit, names } = c.req.query()

    const skipNumber = Number(skip) || 0
    const limitNumber = Number(limit) || MAX_LIMIT

    const namesArray = names ? names.split(',').map((name) => name.trim()) : []

    try {
      const whereClause =
        namesArray.length > 0
          ? or(...namesArray.flatMap((word) => [like(categoryOfTroubles.name, `%${word}%`)]))
          : undefined

      const categories = await db.query.categoryOfTroubles.findMany({
        where: whereClause,
        offset: skipNumber,
        limit: limitNumber,
        orderBy: (categoryOfTroubles, { asc }) => [asc(categoryOfTroubles.createdAt)],
      })

      const total = await db.select({ count: count() }).from(categoryOfTroubles).where(whereClause)

      return c.json(
        {
          troubleCategories: categories,
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
