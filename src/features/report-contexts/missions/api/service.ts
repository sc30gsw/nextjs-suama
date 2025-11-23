import type { RouteHandler } from '@hono/zod-openapi'
import { and, count, eq, like, or } from 'drizzle-orm'
import { QUERY_DEFAULT_PARAMS } from '~/constants'
import { missions, projects } from '~/db/schema'
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
    const { skip, limit, names, isArchived } = params

    const skipNumber = Number(skip) || QUERY_DEFAULT_PARAMS.SKIP
    const namesArray = names ? names.split(',').map((name) => name.trim()) : []
    const shouldFilterArchived = isArchived === 'false'

    try {
      const nameConditions =
        namesArray.length > 0
          ? or(
              ...namesArray.flatMap((word) => [
                like(missions.name, `%${word}%`),
                like(missions.likeKeywords, `%${word}%`),
              ]),
            )
          : undefined

      const whereClause = shouldFilterArchived
        ? nameConditions
          ? and(eq(projects.isArchived, false), nameConditions)
          : eq(projects.isArchived, false)
        : nameConditions

      const totalResult = await db
        .select({ count: count() })
        .from(missions)
        .innerJoin(projects, eq(missions.projectId, projects.id))
        .where(whereClause)
      const total = totalResult[0].count

      const limitNumber = Number(limit) || total

      const missionList = await db
        .select({
          id: missions.id,
          name: missions.name,
          projectId: missions.projectId,
          likeKeywords: missions.likeKeywords,
          createdAt: missions.createdAt,
          updatedAt: missions.updatedAt,
          projectName: projects.name,
        })
        .from(missions)
        .innerJoin(projects, eq(missions.projectId, projects.id))
        .where(whereClause)
        .orderBy(missions.createdAt)
        .limit(limitNumber)
        .offset(skipNumber)

      const formattedMissions = missionList.map((mission) => ({
        ...mission,
        createdAt: mission.createdAt.toISOString(),
        updatedAt: mission.updatedAt?.toISOString() ?? null,
        project: {
          name: mission.projectName,
        },
      }))

      return {
        missions: formattedMissions,
        total,
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
