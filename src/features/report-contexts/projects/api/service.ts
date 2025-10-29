import type { RouteHandler } from '@hono/zod-openapi'
import { count, like, or } from 'drizzle-orm'
import { MAX_LIMIT } from '~/constants'
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
    const { skip, limit, names } = params

    const skipNumber = Number(skip) || 0
    const limitNumber = Number(limit) || MAX_LIMIT
    const namesArray = names ? names.split(',').map((name) => name.trim()) : []

    try {
      const whereClause =
        namesArray.length > 0
          ? or(
              ...namesArray.flatMap((word) => [
                like(projects.name, `%${word}%`),
                like(projects.likeKeywords, `%${word}%`),
              ]),
            )
          : undefined

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

      const total = await db.select({ count: count() }).from(projects).where(whereClause)

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
        total: total[0].count,
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

