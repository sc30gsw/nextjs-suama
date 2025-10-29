import type { RouteHandler } from '@hono/zod-openapi'
import { ERROR_STATUS } from '~/constants/error-message'
import type { getTroubleCategoriesRoute } from '~/features/report-contexts/troubles/api/route'
import {
  TroubleService,
  TroubleServiceError,
} from '~/features/report-contexts/troubles/api/service'

const troubleService = new TroubleService()

export async function getTroubleCategoriesHandler(
  c: Parameters<RouteHandler<typeof getTroubleCategoriesRoute>>[0],
) {
  const params = c.req.valid('query')

  try {
    const result = await troubleService.getTroubleCategories(params)

    return c.json(result, 200)
  } catch (error) {
    if (error instanceof TroubleServiceError) {
      console.error('TroubleService error:', error.message)
    }
    return c.json(
      {
        error: ERROR_STATUS.SOMETHING_WENT_WRONG,
      },
      500,
    )
  }
}
