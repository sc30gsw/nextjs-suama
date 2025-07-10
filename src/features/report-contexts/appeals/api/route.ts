import { count, like, or } from 'drizzle-orm'
import { Hono } from 'hono'
import { MAX_LIMIT } from '~/constants'
import { categoriesOfAppeal } from '~/db/schema'
import { db } from '~/index'
import { sessionMiddleware } from '~/lib/session-middleware'

const app = new Hono().get('/categories', sessionMiddleware, async (c) => {
  const { skip, limit, names } = c.req.query()

  const skipNumber = Number(skip) || 0
  const limitNumber = Number(limit) || MAX_LIMIT

  const namesArray = names ? names.split(',').map((name) => name.trim()) : []

  try {
    const whereClause =
      namesArray.length > 0
        ? or(...namesArray.flatMap((word) => [like(categoriesOfAppeal.name, `%${word}%`)]))
        : undefined

    const categories = await db.query.categoriesOfAppeal.findMany({
      where: whereClause,
      offset: skipNumber,
      limit: limitNumber,
      orderBy: (categoriesOfAppeal, { asc }) => [asc(categoriesOfAppeal.createdAt)],
    })

    const total = await db.select({ count: count() }).from(categoriesOfAppeal).where(whereClause)

    return c.json(
      {
        appealCategories: categories,
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
