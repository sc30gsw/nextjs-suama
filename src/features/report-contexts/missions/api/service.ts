import type { RouteHandler } from '@hono/zod-openapi'
import { count, like, or } from 'drizzle-orm'
import { PAGINATION } from '~/constants/pagination'
import { missions } from '~/db/schema'
import type { getMissionsRoute } from '~/features/report-contexts/missions/api/route'
import { db } from '~/index'

export class MissionServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MissionServiceError'
  }
}

export class MissionService {
  async getMissions(
    params: ReturnType<Parameters<RouteHandler<typeof getMissionsRoute>>[0]['req']['valid']>,
  ) {
    const { skip, limit, names } = params

    const skipNumber = Number(skip) || PAGINATION.PARAMS.DEFAULT_SKIP
    const limitNumber = Number(limit) || PAGINATION.PARAMS.MAX_LIMIT
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
        orderBy: (missionsTable, { asc }) => [asc(missionsTable.createdAt)],
        with: {
          project: {
            columns: {
              name: true,
            },
          },
        },
      })

      const total = await db.select({ count: count() }).from(missions).where(whereClause)

      const formattedMissions = missionList.map((mission) => ({
        ...mission,
        createdAt: mission.createdAt.toISOString(),
        updatedAt: mission.updatedAt?.toISOString() ?? null,
      }))

      return {
        missions: formattedMissions,
        total: total[0].count,
        skip: skipNumber,
        limit: limitNumber,
      }
    } catch (error) {
      throw new MissionServiceError(
        `Failed to get missions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
