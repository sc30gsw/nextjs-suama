import type { RouteHandler } from '@hono/zod-openapi'
import { ERROR_STATUS } from '~/constants/error-message'
import type {
  getCountRoute,
  getMineReportsRoute,
  getMineSummaryRoute,
  getReportDetailRoute,
  getTodayReportsRoute,
} from '~/features/reports/daily/api/route'
import { DailyReportService, DailyReportServiceError } from '~/features/reports/daily/api/service'
import type { AdditionalVariables } from '~/features/reports/types'

const dailyReportService = new DailyReportService()

export const getTodayReportsHandler: RouteHandler<
  typeof getTodayReportsRoute,
  AdditionalVariables
> = async (c) => {
  const params = c.req.valid('query')

  try {
    const result = await dailyReportService.getTodayReports(params)

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

export const getMineReportsHandler: RouteHandler<
  typeof getMineReportsRoute,
  AdditionalVariables
> = async (c) => {
  const params = c.req.valid('query')
  const user = c.get('user')

  try {
    const result = await dailyReportService.getMineReports(params, user.id, user.name)

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

export const getMineSummaryHandler: RouteHandler<
  typeof getMineSummaryRoute,
  AdditionalVariables
> = async (c) => {
  const params = c.req.valid('query')
  const userId = c.get('user').id

  try {
    const result = await dailyReportService.getMineSummary(params, userId)

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

export const getCountHandler: RouteHandler<typeof getCountRoute, AdditionalVariables> = async (
  c,
) => {
  const params = c.req.valid('query')
  const userId = c.get('user').id

  try {
    const result = await dailyReportService.getCount(params, userId)

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

export const getReportDetailHandler: RouteHandler<
  typeof getReportDetailRoute,
  AdditionalVariables
> = async (c) => {
  const params = c.req.valid('param')
  const userId = c.get('user').id

  try {
    const result = await dailyReportService.getReportDetail(params, userId)

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
