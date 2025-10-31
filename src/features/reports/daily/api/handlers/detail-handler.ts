import type { RouteHandler } from '@hono/zod-openapi'
import { ERROR_STATUS } from '~/constants/error-message'
import type {
  getDailyReportDetailRoute,
  getDailyReportSummaryRoute,
} from '~/features/reports/daily/api/route'
import { DailyReportDetailService } from '~/features/reports/daily/api/services/detail-service'
import { DailyReportServiceError } from '~/features/reports/daily/api/services/list-service'
import type { AdditionalVariables } from '~/features/reports/types'

const dailyReportDetailService = new DailyReportDetailService()

export const getDailyReportSummaryHandler: RouteHandler<
  typeof getDailyReportSummaryRoute,
  AdditionalVariables
> = async (c) => {
  const params = c.req.valid('query')

  try {
    const result = await dailyReportDetailService.getDailyReportSummary(params)

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

export const getDailyReportDetailHandler: RouteHandler<
  typeof getDailyReportDetailRoute,
  AdditionalVariables
> = async (c) => {
  const { id } = c.req.valid('param')
  const { userId: queryUserId } = c.req.valid('query')
  const authenticatedUserId = c.get('user').id

  try {
    const result = await dailyReportDetailService.getDailyReportDetail(
      { id, userId: queryUserId },
      authenticatedUserId,
    )

    if (!result) {
      return c.json({ error: 'Report not found or unauthorized' }, 404)
    }

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
