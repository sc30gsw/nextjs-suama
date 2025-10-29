import type { RouteHandler } from '@hono/zod-openapi'
import { count, like, or } from 'drizzle-orm'
import { MAX_LIMIT } from '~/constants'
import { ERROR_STATUS } from '~/constants/error-message'
import { projects } from '~/db/schema'
import type { getProjectsRoute } from '~/features/report-contexts/projects/api/route'
import { db } from '~/index'

export async function getProjectsHandler(c: Parameters<RouteHandler<typeof getProjectsRoute>>[0]) {
  const { skip, limit, names } = c.req.valid('query')

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

    return c.json(
      {
        projects: formattedProjects,
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
