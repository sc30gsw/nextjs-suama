import type { RouteHandler } from '@hono/zod-openapi'
import { count, eq, like, or } from 'drizzle-orm'
import { MAX_LIMIT } from '~/constants'
import { ERROR_STATUS } from '~/constants/error-message'
import { appeals, categoryOfAppeals } from '~/db/schema'
import type { getAppealCategoriesRoute } from '~/features/report-contexts/appeals/api/route'
import { db } from '~/index'

export async function getAppealCategoriesHandler(
  c: Parameters<RouteHandler<typeof getAppealCategoriesRoute>>[0],
) {
  const { skip, limit, names, withData, reportId } = c.req.valid('query')

  const skipNumber = Number(skip) || 0
  const limitNumber = Number(limit) || MAX_LIMIT

  const namesArray = names ? names.split(',').map((name) => name.trim()) : []

  try {
    const whereClause =
      namesArray.length > 0
        ? or(...namesArray.flatMap((word) => [like(categoryOfAppeals.name, `%${word}%`)]))
        : undefined

    const categories = await db.query.categoryOfAppeals.findMany({
      where: whereClause,
      offset: skipNumber,
      limit: limitNumber,
      orderBy: (categoryOfAppealsTable, { asc }) => [asc(categoryOfAppealsTable.createdAt)],
    })

    const total = await db.select({ count: count() }).from(categoryOfAppeals).where(whereClause)

    let existingAppeals: {
      id: string
      categoryOfAppealId: string
      appeal: string
    }[] = []

    if (withData === 'true' && reportId) {
      const appealsData = await db.query.appeals.findMany({
        columns: {
          id: true,
          categoryOfAppealId: true,
          appeal: true,
        },
        where: eq(appeals.dailyReportId, reportId),
        orderBy: (appealsTable, { desc }) => [desc(appealsTable.createdAt)],
      })

      existingAppeals = appealsData
    }

    const formattedCategories = categories.map((category) => ({
      ...category,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt?.toISOString() ?? null,
    }))

    return c.json(
      {
        appealCategories: formattedCategories,
        total: total[0].count,
        skip: skipNumber,
        limit: limitNumber,
        existingAppeals,
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
