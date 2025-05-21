import { count, like, or } from 'drizzle-orm'
import { Hono } from 'hono'
import { MAX_LIMIT } from '~/constants'
import { projects } from '~/db/schema'
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
              like(projects.name, `%${word}%`),
              like(projects.likeKeywords, `%${word}%`),
            ]),
          )
        : undefined

    const projectList = await db.query.projects.findMany({
      where: whereClause,
      offset: skipNumber,
      limit: limitNumber,
      orderBy: (projects, { asc }) => [asc(projects.createdAt)],
      with: {
        client: true,
        missions: {
          columns: {
            id: true,
          },
        },
      },
    })

    const total = await db
      .select({ count: count() })
      .from(projects)
      .where(whereClause)

    return c.json(
      {
        projects: projectList,
        total: total[0].count,
        skip: skipNumber,
        limit: limitNumber,
      },
      200,
    )
  } catch (_) {
    return c.json(
      {
        error: 'Something went wrong',
      },
      500,
    )
  }
})

export default app
