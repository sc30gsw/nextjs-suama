import type { RouteHandler } from '@hono/zod-openapi'
import { ERROR_STATUS } from '~/constants/error-message'
import type { getDailyReportsListRoute } from '~/features/reports/daily/api/route'
import {
  DailyReportListService,
  DailyReportServiceError,
} from '~/features/reports/daily/api/services/list-service'
import type { AdditionalVariables } from '~/features/reports/types'

const dailyReportListService = new DailyReportListService()

export const getDailyReportsListHandler: RouteHandler<
  typeof getDailyReportsListRoute,
  AdditionalVariables
> = async (c) => {
  const params = c.req.valid('query')

  try {
    const result = await dailyReportListService.getDailyReportsList(params)

    return c.json(result, 200)
  } catch (error) {
    if (error instanceof DailyReportServiceError) {
      console.error('DailyReportService error:', error.message)
    }

    return c.json(
      {
        error: ERROR_STATUS.SOMETHING_WENT_WRONG,
      },
      500,
    )
  }
}
