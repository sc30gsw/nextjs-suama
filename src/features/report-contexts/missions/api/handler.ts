import type { RouteHandler } from '@hono/zod-openapi'
import { ERROR_STATUS } from '~/constants/error-message'
import type { getMissionsRoute } from '~/features/report-contexts/missions/api/route'
import {
  MissionService,
  MissionServiceError,
} from '~/features/report-contexts/missions/api/service'

const missionService = new MissionService()

export async function getMissionsHandler(c: Parameters<RouteHandler<typeof getMissionsRoute>>[0]) {
  const { skip, limit, names, isArchived } = c.req.valid('query')

  try {
    const result = await missionService.getMissions({
      skip,
      limit,
      names,
      isArchived,
    })

    return c.json(result, 200)
  } catch (error) {
    if (error instanceof MissionServiceError) {
      console.error('MissionService error:', error.message)
    }

    return c.json(
      {
        error: ERROR_STATUS.SOMETHING_WENT_WRONG,
      },
      500,
    )
  }
}
