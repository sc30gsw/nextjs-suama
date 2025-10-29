import type { RouteHandler } from '@hono/zod-openapi'
import { ERROR_STATUS } from '~/constants/error-message'
import {
  MissionService,
  MissionServiceError,
} from '~/features/report-contexts/missions/api/mission-service'
import type { getMissionsRoute } from '~/features/report-contexts/missions/api/route'

const missionService = new MissionService()

export async function getMissionsHandler(c: Parameters<RouteHandler<typeof getMissionsRoute>>[0]) {
  const { skip, limit, names } = c.req.valid('query')

  try {
    const result = await missionService.getMissions({
      skip,
      limit,
      names,
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
