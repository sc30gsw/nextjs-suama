import type { RouteHandler } from '@hono/zod-openapi'
import { and, asc, count, desc, eq, like, or } from 'drizzle-orm'
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
    const { skip, limit, names, archiveStatus, sortBy, sortOrder } = params

    const skipNumber = Number(skip) || QUERY_DEFAULT_PARAMS.SKIP
    const namesArray = names ? names.split(',').map((name) => name.trim()) : []

    try {
      const nameConditions =
        namesArray.length > 0
          ? or(
              ...namesArray.flatMap((word) => [
                like(missions.name, `%${word}%`),
                like(missions.likeKeywords, `%${word}%`),
                like(projects.name, `%${word}%`),
                like(projects.likeKeywords, `%${word}%`),
              ]),
            )
          : undefined

      const archiveCondition =
        archiveStatus === 'active'
          ? eq(projects.isArchived, false)
          : archiveStatus === 'archived'
            ? eq(projects.isArchived, true)
            : undefined

      const whereClause =
        archiveCondition && nameConditions
          ? and(archiveCondition, nameConditions)
          : archiveCondition
            ? archiveCondition
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
          isArchived: projects.isArchived,
          createdAt: missions.createdAt,
          updatedAt: missions.updatedAt,
          projectName: projects.name,
        })
        .from(missions)
        .innerJoin(projects, eq(missions.projectId, projects.id))
        .where(whereClause)
        .orderBy(
          ...(() => {
            const orderByArray: ReturnType<typeof asc>[] = []

            if (sortBy && sortOrder) {
              if (sortBy === 'name') {
                orderByArray.push(sortOrder === 'asc' ? asc(missions.name) : desc(missions.name))
              } else if (sortBy === 'status') {
                orderByArray.push(
                  sortOrder === 'asc' ? asc(projects.isArchived) : desc(projects.isArchived),
                )
              }

              orderByArray.push(asc(projects.isArchived))
            } else {
              orderByArray.push(asc(projects.isArchived))
            }

            orderByArray.push(asc(projects.name))
            orderByArray.push(asc(missions.name))

            return orderByArray
          })(),
        )
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
