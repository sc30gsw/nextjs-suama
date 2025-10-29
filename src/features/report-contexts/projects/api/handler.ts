import type { RouteHandler } from '@hono/zod-openapi'
import { ERROR_STATUS } from '~/constants/error-message'
import {
  ProjectService,
  ProjectServiceError,
} from '~/features/report-contexts/projects/api/project-service'
import type { getProjectsRoute } from '~/features/report-contexts/projects/api/route'

const projectService = new ProjectService()

export async function getProjectsHandler(c: Parameters<RouteHandler<typeof getProjectsRoute>>[0]) {
  const { skip, limit, names } = c.req.valid('query')

  try {
    const result = await projectService.getProjects({
      skip,
      limit,
      names,
    })

    return c.json(result, 200)
  } catch (error) {
    if (error instanceof ProjectServiceError) {
      console.error('ProjectService error:', error.message)
    }
    return c.json(
      {
        error: ERROR_STATUS.SOMETHING_WENT_WRONG,
      },
      500,
    )
  }
}
