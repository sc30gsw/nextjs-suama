import type { Session } from 'better-auth'
import { and, type asc, count, eq, like, or } from 'drizzle-orm'
import { QUERY_DEFAULT_PARAMS, QUERY_MAX_LIMIT_VALUES } from '~/constants'
import { categoryOfTroubles, troubles } from '~/db/schema'
import { getDb } from '~/index'
import type { TroubleModel } from '~/features/report-contexts/troubles/api/model'
import {
  TroubleServiceError,
  TroubleNotFoundError,
} from '~/features/report-contexts/troubles/api/errors'

export abstract class TroubleService {
  static async getTroubleCategories(
    params: TroubleModel.getTroubleCategoriesQuery,
    userId: Session['userId'],
  ) {
    try {
      const db = getDb()
      const { skip, limit, names, withData, sortBy, sortOrder } = params

      const skipNumber = Number(skip) || QUERY_DEFAULT_PARAMS.SKIP
      const limitNumber = Number(limit) || QUERY_MAX_LIMIT_VALUES.GENERAL
      const namesArray = names ? names.split(',').map((name) => name.trim()) : []
      const whereClause =
        namesArray.length > 0
          ? or(...namesArray.flatMap((word) => [like(categoryOfTroubles.name, `%${word}%`)]))
          : undefined

      const categories = await db.query.categoryOfTroubles.findMany({
        where: whereClause,
        offset: skipNumber,
        limit: limitNumber,
        orderBy: (categoryOfTroublesTable, { asc: ascFn, desc: descFn }) => {
          const orderByArray: ReturnType<typeof asc>[] = []

          if (sortBy && sortOrder && sortBy === 'name') {
            orderByArray.push(
              sortOrder === 'asc'
                ? ascFn(categoryOfTroublesTable.name)
                : descFn(categoryOfTroublesTable.name),
            )
          }

          orderByArray.push(ascFn(categoryOfTroublesTable.createdAt))

          return orderByArray
        },
      })

      const total = await db.select({ count: count() }).from(categoryOfTroubles).where(whereClause)

      let unResolvedTroubles: Pick<
        typeof troubles.$inferSelect,
        'id' | 'categoryOfTroubleId' | 'trouble' | 'resolved'
      >[] = []

      if (withData === 'true') {
        unResolvedTroubles = await db.query.troubles.findMany({
          columns: {
            id: true,
            categoryOfTroubleId: true,
            trouble: true,
            resolved: true,
          },
          where: and(eq(troubles.resolved, false), eq(troubles.userId, userId)),
          orderBy: (troublesTable, { desc }) => [desc(troublesTable.createdAt)],
        })
      }

      const formattedCategories = categories.map((category) => ({
        ...category,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt?.toISOString() ?? null,
      }))

      return {
        troubleCategories: formattedCategories,
        total: total[0].count,
        skip: skipNumber,
        limit: limitNumber,
        unResolvedTroubles,
      }
    } catch (error) {
      if (error instanceof TroubleServiceError || error instanceof TroubleNotFoundError) {
        throw error
      }
      throw new TroubleServiceError(
        `Failed to get trouble categories: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
