import type { RouteHandler } from '@hono/zod-openapi'
import { ERROR_STATUS } from '~/constants/error-message'
import type { getTroubleCategoriesRoute } from '~/features/report-contexts/troubles/api/route'
import {
  TroubleService,
  TroubleServiceError,
} from '~/features/report-contexts/troubles/api/service'
import type { AdditionalVariables } from '~/features/reports/types'

const troubleService = new TroubleService()

export async function getTroubleCategoriesHandler(
  c: Parameters<RouteHandler<typeof getTroubleCategoriesRoute, AdditionalVariables>>[0],
) {
  const params = c.req.valid('query')
  const user = c.get('user')

  try {
    const result = await troubleService.getTroubleCategories(params, user.id)

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
