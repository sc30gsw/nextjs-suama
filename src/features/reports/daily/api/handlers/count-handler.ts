import type { RouteHandler } from '@hono/zod-openapi'
import { ERROR_STATUS } from '~/constants/error-message'
import type { getCountRoute } from '~/features/reports/daily/api/route'
import { DailyReportCountService } from '~/features/reports/daily/api/services/count-service'
import { DailyReportServiceError } from '~/features/reports/daily/api/services/list-service'
import type { AdditionalVariables } from '~/features/reports/types'

const dailyReportCountService = new DailyReportCountService()

export const getCountHandler: RouteHandler<typeof getCountRoute, AdditionalVariables> = async (
  c,
) => {
  const params = c.req.valid('query')

  try {
    const result = await dailyReportCountService.getCount(params)

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
