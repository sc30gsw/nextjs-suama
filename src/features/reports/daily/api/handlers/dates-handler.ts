import type { RouteHandler } from '@hono/zod-openapi'
import { ERROR_STATUS } from '~/constants/error-message'
import type { getDailyReportDatesRoute } from '~/features/reports/daily/api/route'
import {
  DailyReportDatesService,
  DailyReportDatesServiceError,
} from '~/features/reports/daily/api/services/dates-service'
import type { AdditionalVariables } from '~/features/reports/types'

const dailyReportDatesService = new DailyReportDatesService()

export const getDailyReportDatesHandler: RouteHandler<
  typeof getDailyReportDatesRoute,
  AdditionalVariables
> = async (c) => {
  const params = c.req.valid('query')
  const userId = c.get('user').id

  try {
    const result = await dailyReportDatesService.getDailyReportDates(userId, params)

    return c.json(result, 200)
  } catch (error) {
    if (error instanceof DailyReportDatesServiceError) {
      console.error('DailyReportDatesService error:', error.message)
    }

    return c.json(
      {
        error: ERROR_STATUS.SOMETHING_WENT_WRONG,
      },
      500,
    )
  }
}

