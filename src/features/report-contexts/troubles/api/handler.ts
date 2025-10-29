import type { RouteHandler } from '@hono/zod-openapi'
import { count, eq, like, or } from 'drizzle-orm'
import { MAX_LIMIT } from '~/constants'
import { ERROR_STATUS } from '~/constants/error-message'
import { categoryOfTroubles, troubles } from '~/db/schema'
import type { getTroubleCategoriesRoute } from '~/features/report-contexts/troubles/api/route'
import { db } from '~/index'

export async function getTroubleCategoriesHandler(
  c: Parameters<RouteHandler<typeof getTroubleCategoriesRoute>>[0],
) {
  const { skip, limit, names, withData } = c.req.valid('query')

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
      orderBy: (categoryOfTroublesTable, { asc }) => [asc(categoryOfTroublesTable.createdAt)],
    })

    const total = await db.select({ count: count() }).from(categoryOfTroubles).where(whereClause)

    let unResolvedTroubles: {
      id: string
      categoryOfTroubleId: string
      trouble: string
      resolved: boolean
    }[] = []

    if (withData === 'true') {
      unResolvedTroubles = await db.query.troubles.findMany({
        columns: {
          id: true,
          categoryOfTroubleId: true,
          trouble: true,
          resolved: true,
        },
        where: eq(troubles.resolved, false),
        orderBy: (troublesTable, { desc }) => [desc(troublesTable.createdAt)],
      })
    }

    const formattedCategories = categories.map((category) => ({
      ...category,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt?.toISOString() ?? null,
    }))

    return c.json(
      {
        troubleCategories: formattedCategories,
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
}
