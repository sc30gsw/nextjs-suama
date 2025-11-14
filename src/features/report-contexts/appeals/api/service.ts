import type { RouteHandler } from '@hono/zod-openapi'
import { count, eq, like, or } from 'drizzle-orm'
import { PAGINATION } from '~/constants/pagination'
import { appeals, categoryOfAppeals } from '~/db/schema'
import type { getAppealCategoriesRoute } from '~/features/report-contexts/appeals/api/route'
import { db } from '~/index'

export class AppealServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AppealServiceError'
  }
}

export class AppealService {
  async getAppealCategories(
    params: ReturnType<
      Parameters<RouteHandler<typeof getAppealCategoriesRoute>>[0]['req']['valid']
    >,
  ) {
    const { skip, limit, names, withData, reportId } = params

    const skipNumber = Number(skip) || PAGINATION.VALUES.DEFAULTS.SKIP
    const limitNumber = Number(limit) || PAGINATION.VALUES.LIMITS.MAX_LIMIT
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

      return {
        appealCategories: formattedCategories,
        total: total[0].count,
        skip: skipNumber,
        limit: limitNumber,
        existingAppeals,
      }
    } catch (error) {
      throw new AppealServiceError(
        `Failed to get appeal categories: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
