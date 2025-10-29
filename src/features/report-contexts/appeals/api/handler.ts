import type { RouteHandler } from '@hono/zod-openapi'
import { ERROR_STATUS } from '~/constants/error-message'
import {
  AppealService,
  AppealServiceError,
} from '~/features/report-contexts/appeals/api/appeal-service'
import type { getAppealCategoriesRoute } from '~/features/report-contexts/appeals/api/route'

const appealService = new AppealService()

export async function getAppealCategoriesHandler(
  c: Parameters<RouteHandler<typeof getAppealCategoriesRoute>>[0],
) {
  const params = c.req.valid('query')

  try {
    const result = await appealService.getAppealCategories(params)

    return c.json(result, 200)
  } catch (error) {
    if (error instanceof AppealServiceError) {
      console.error('AppealService error:', error.message)
    }
    return c.json(
      {
        error: ERROR_STATUS.SOMETHING_WENT_WRONG,
      },
      500,
    )
  }
}
