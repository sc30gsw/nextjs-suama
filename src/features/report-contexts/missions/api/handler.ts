import type { RouteHandler } from '@hono/zod-openapi'
import { count, like, or } from 'drizzle-orm'
import { MAX_LIMIT } from '~/constants'
import { ERROR_STATUS } from '~/constants/error-message'
import { missions } from '~/db/schema'
import type { getMissionsRoute } from '~/features/report-contexts/missions/api/route'
import { db } from '~/index'

export async function getMissionsHandler(c: Parameters<RouteHandler<typeof getMissionsRoute>>[0]) {
  const { skip, limit, names } = c.req.valid('query')

  const skipNumber = Number(skip) || 0
  const limitNumber = Number(limit) || MAX_LIMIT

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

    return c.json(
      {
        missions: formattedMissions,
        total: total[0].count,
        skip: skipNumber,
        limit: limitNumber,
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
