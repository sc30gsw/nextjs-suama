import type { RouteHandler } from '@hono/zod-openapi'
import type { Session } from 'better-auth'
import { and, count, eq, like, or } from 'drizzle-orm'
import { PAGINATION } from '~/constants/pagination'
import { categoryOfTroubles, troubles } from '~/db/schema'
import type { getTroubleCategoriesRoute } from '~/features/report-contexts/troubles/api/route'
import { db } from '~/index'

export class TroubleServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TroubleServiceError'
  }
}

export class TroubleService {
  async getTroubleCategories(
    params: ReturnType<
      Parameters<RouteHandler<typeof getTroubleCategoriesRoute>>[0]['req']['valid']
    >,
    userId: Session['userId'],
  ) {
    const { skip, limit, names, withData } = params

    const skipNumber = Number(skip) || PAGINATION.VALUES.DEFAULTS.SKIP
    const limitNumber = Number(limit) || PAGINATION.VALUES.LIMITS.MAX_LIMIT
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
      throw new TroubleServiceError(
        `Failed to get trouble categories: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
