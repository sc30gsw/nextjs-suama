import { count, like, or } from 'drizzle-orm'
import { Hono } from 'hono'
import { MAX_LIMIT } from '~/constants'
import { ERROR_STATUS } from '~/constants/error-message'
import { missions } from '~/db/schema'
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
              like(missions.name, `%${word}%`),
              like(missions.likeKeywords, `%${word}%`),
            ]),
          )
        : undefined

    const missionList = await db.query.missions.findMany({
      where: whereClause,
      offset: skipNumber,
      limit: limitNumber,
      orderBy: (missions, { asc }) => [asc(missions.createdAt)],
      with: {
        project: {
          columns: {
            name: true,
          },
        },
      },
    })

    const total = await db.select({ count: count() }).from(missions).where(whereClause)

    return c.json(
      {
        missions: missionList,
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
