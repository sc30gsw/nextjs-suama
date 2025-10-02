import { count, eq, type InferSelectModel, like, or } from 'drizzle-orm'
import { Hono } from 'hono'
import { MAX_LIMIT } from '~/constants'
import { ERROR_STATUS } from '~/constants/error-message'
import { categoryOfTroubles, troubles } from '~/db/schema'
import { db } from '~/index'
import { sessionMiddleware } from '~/lib/session-middleware'

type UnResolvedTrouble = Pick<
  InferSelectModel<typeof troubles>,
  'id' | 'categoryOfTroubleId' | 'trouble' | 'resolved'
>

const app = new Hono().get('/categories', sessionMiddleware, async (c) => {
  // トラブルカテゴリーと、withData=trueの場合には未解決のトラブルも取得するAPI
  const { skip, limit, names, withData } = c.req.query()

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

    let unResolvedTroubles: UnResolvedTrouble[]

    if (withData === 'true') {
      unResolvedTroubles = await db.query.troubles.findMany({
        columns: {
          id: true,
          categoryOfTroubleId: true,
          trouble: true,
          resolved: true,
        },
        where: eq(troubles.resolved, false),
        orderBy: (troubles, { desc }) => [desc(troubles.createdAt)],
      })
    } else {
      unResolvedTroubles = []
    }

    return c.json(
      {
        troubleCategories: categories,
        total: total[0].count,
        skip: skipNumber,
        limit: limitNumber,
        unResolvedTroubles,
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
