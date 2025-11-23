import type { RouteHandler } from '@hono/zod-openapi'
import { and, count, eq, like, or } from 'drizzle-orm'
import { QUERY_DEFAULT_PARAMS, QUERY_MAX_LIMIT_VALUES } from '~/constants'
import { projects } from '~/db/schema'
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
    const { skip, limit, names, isArchived } = params

    const skipNumber = Number(skip) || QUERY_DEFAULT_PARAMS.SKIP
    const namesArray = names ? names.split(',').map((name) => name.trim()) : []
    const shouldFilterArchived = isArchived === 'false'

    try {
      const nameConditions =
        namesArray.length > 0
          ? or(
              ...namesArray.flatMap((word) => [
                like(projects.name, `%${word}%`),
                like(projects.likeKeywords, `%${word}%`),
              ]),
            )
          : undefined

      const whereClause =
        shouldFilterArchived && nameConditions
          ? and(eq(projects.isArchived, false), nameConditions)
          : shouldFilterArchived
            ? eq(projects.isArchived, false)
            : nameConditions

      const totalResult = await db.select({ count: count() }).from(projects).where(whereClause)
      const total = totalResult[0].count

      const limitNumber = shouldFilterArchived
        ? total
        : Number(limit) || QUERY_MAX_LIMIT_VALUES.GENERAL

      const projectList = await db.query.projects.findMany({
        where: whereClause,
        offset: skipNumber,
        limit: limitNumber,
        orderBy: (projectsTable, { asc }) => [asc(projectsTable.createdAt)],
        with: {
          client: true,
          missions: {
            columns: {
              id: true,
            },
          },
        },
      })

      const formattedProjects = projectList.map((project) => ({
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt?.toISOString() ?? null,
        client: {
          ...project.client,
          createdAt: project.client.createdAt.toISOString(),
          updatedAt: project.client.updatedAt?.toISOString() ?? null,
        },
      }))

      return {
        projects: formattedProjects,
        total: total,
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
