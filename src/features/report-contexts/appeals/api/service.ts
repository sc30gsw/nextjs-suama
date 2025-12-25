import { type asc, count, eq, like, or } from 'drizzle-orm'
import { QUERY_DEFAULT_PARAMS, QUERY_MAX_LIMIT_VALUES } from '~/constants'
import { appeals, categoryOfAppeals } from '~/db/schema'
import { db } from '~/index'
import type { AppealModel } from '~/features/report-contexts/appeals/api/model'
import {
  AppealServiceError,
  AppealNotFoundError,
} from '~/features/report-contexts/appeals/api/errors'

export abstract class AppealService {
  static async getAppealCategories(params: AppealModel.getAppealCategoriesQuery) {
    try {
      const { skip, limit, names, withData, reportId, sortBy, sortOrder } = params

      const skipNumber = Number(skip) || QUERY_DEFAULT_PARAMS.SKIP
      const limitNumber = Number(limit) || QUERY_MAX_LIMIT_VALUES.GENERAL
      const namesArray = names ? names.split(',').map((name) => name.trim()) : []
      const whereClause =
        namesArray.length > 0
          ? or(...namesArray.flatMap((word) => [like(categoryOfAppeals.name, `%${word}%`)]))
          : undefined

      const categories = await db.query.categoryOfAppeals.findMany({
        where: whereClause,
        offset: skipNumber,
        limit: limitNumber,
        orderBy: (categoryOfAppealsTable, { asc: ascFn, desc: descFn }) => {
          const orderByArray: ReturnType<typeof asc>[] = []

          if (sortBy && sortOrder && sortBy === 'name') {
            orderByArray.push(
              sortOrder === 'asc'
                ? ascFn(categoryOfAppealsTable.name)
                : descFn(categoryOfAppealsTable.name),
            )
          }

          orderByArray.push(ascFn(categoryOfAppealsTable.createdAt))

          return orderByArray
        },
      })

      const total = await db.select({ count: count() }).from(categoryOfAppeals).where(whereClause)

      let existingAppeals: Pick<
        typeof appeals.$inferSelect,
        'id' | 'categoryOfAppealId' | 'appeal'
      >[] = []

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
      if (error instanceof AppealServiceError || error instanceof AppealNotFoundError) {
        throw error
      }

      throw new AppealServiceError(
        `Failed to get appeal categories: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
