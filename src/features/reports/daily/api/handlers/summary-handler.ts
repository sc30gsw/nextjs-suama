import type { RouteHandler } from '@hono/zod-openapi'
import { ERROR_STATUS } from '~/constants/error-message'
import type { getDailyReportSummaryRoute } from '~/features/reports/daily/api/route'
import { DailyReportServiceError } from '~/features/reports/daily/api/services/list-service'
import { DailyReportSummaryService } from '~/features/reports/daily/api/services/summary-service'
import type { AdditionalVariables } from '~/features/reports/types'

const dailyReportSummaryService = new DailyReportSummaryService()

export const getDailyReportSummaryHandler: RouteHandler<
  typeof getDailyReportSummaryRoute,
  AdditionalVariables
> = async (c) => {
  const params = c.req.valid('query')

  try {
    const result = await dailyReportSummaryService.getDailyReportSummary(params)

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
