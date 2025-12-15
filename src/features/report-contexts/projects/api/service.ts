import type { RouteHandler } from '@hono/zod-openapi'
import { and, asc, count, eq, like, or } from 'drizzle-orm'
import { QUERY_DEFAULT_PARAMS } from '~/constants'
import { clients, projects } from '~/db/schema'
import type { getProjectsRoute } from '~/features/report-contexts/projects/api/route'
import { db } from '~/index'

export class ProjectServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ProjectServiceError'
  }
}

export class ProjectService {
  async getProjects(
    params: ReturnType<Parameters<RouteHandler<typeof getProjectsRoute>>[0]['req']['valid']>,
  ) {
    const { skip, limit, names, archiveStatus } = params

    const skipNumber = Number(skip) || QUERY_DEFAULT_PARAMS.SKIP
    const namesArray = names ? names.split(',').map((name) => name.trim()) : []

    try {
      const nameConditions =
        namesArray.length > 0
          ? or(
              ...namesArray.flatMap((word) => [
                like(projects.name, `%${word}%`),
                like(projects.likeKeywords, `%${word}%`),
                like(clients.name, `%${word}%`),
                like(clients.likeKeywords, `%${word}%`),
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
        .from(projects)
        .innerJoin(clients, eq(projects.clientId, clients.id))
        .where(whereClause)
      const total = totalResult[0].count

      const limitNumber = Number(limit) || total

      const projectList = await db
        .select({
          id: projects.id,
          name: projects.name,
          likeKeywords: projects.likeKeywords,
          isArchived: projects.isArchived,
          clientId: projects.clientId,
          createdAt: projects.createdAt,
          updatedAt: projects.updatedAt,
          clientName: clients.name,
          clientLikeKeywords: clients.likeKeywords,
          clientCreatedAt: clients.createdAt,
          clientUpdatedAt: clients.updatedAt,
        })
        .from(projects)
        .innerJoin(clients, eq(projects.clientId, clients.id))
        .where(whereClause)
        .orderBy(asc(clients.name), asc(projects.name))
        .limit(limitNumber)
        .offset(skipNumber)

      const projectIds = projectList.map((p) => p.id)

      const missionsCount = await db.query.missions.findMany({
        where: (missionsTable, { inArray }) => inArray(missionsTable.projectId, projectIds),
        columns: {
          id: true,
          projectId: true,
        },
      })

      const missionsByProjectId = missionsCount.reduce(
        (acc, mission) => {
          if (!acc[mission.projectId]) {
            acc[mission.projectId] = []
          }
          acc[mission.projectId].push({ id: mission.id })
          return acc
        },
        {} as Record<string, Array<{ id: string }>>,
      )

      const formattedProjects = projectList.map((project) => ({
        id: project.id,
        name: project.name,
        likeKeywords: project.likeKeywords,
        isArchived: project.isArchived,
        clientId: project.clientId,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt?.toISOString() ?? null,
        client: {
          id: project.clientId,
          name: project.clientName,
          likeKeywords: project.clientLikeKeywords,
          createdAt: project.clientCreatedAt.toISOString(),
          updatedAt: project.clientUpdatedAt?.toISOString() ?? null,
        },
        missions: missionsByProjectId[project.id] ?? [],
      }))

      return {
        projects: formattedProjects,
        total,
        skip: skipNumber,
        limit: limitNumber,
      }
    } catch (error) {
      throw new ProjectServiceError(
        `Failed to get projects: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
