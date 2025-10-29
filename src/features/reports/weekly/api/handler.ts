import type { RouteHandler } from '@hono/zod-openapi'
import { ERROR_STATUS } from '~/constants/error-message'
import type { AdditionalVariables } from '~/features/reports/types'
import type {
  getCurrentUserWeeklyReportRoute,
  getLastWeekReportRoute,
  getWeeklyReportByIdRoute,
  getWeeklyReportsRoute,
} from '~/features/reports/weekly/api/route'
import {
  WeeklyReportService,
  WeeklyReportServiceError,
} from '~/features/reports/weekly/api/service'

const weeklyReportService = new WeeklyReportService()

export const getWeeklyReportsHandler: RouteHandler<
  typeof getWeeklyReportsRoute,
  AdditionalVariables
> = async (c) => {
  const params = c.req.valid('query')

  try {
    const result = await weeklyReportService.getWeeklyReports(params)

    return c.json(result, 200)
  } catch (error) {
    if (error instanceof WeeklyReportServiceError) {
      console.error('WeeklyReportService error:', error.message)
    }
    return c.json(
      {
        error: ERROR_STATUS.SOMETHING_WENT_WRONG,
      },
      500,
    )
  }
}

export const getWeeklyReportByIdHandler: RouteHandler<
  typeof getWeeklyReportByIdRoute,
  AdditionalVariables
> = async (c) => {
  const params = c.req.valid('param')

  try {
    const result = await weeklyReportService.getWeeklyReportById(params)

    return c.json(result, 200)
  } catch (error) {
    if (error instanceof WeeklyReportServiceError) {
      console.error('WeeklyReportService error:', error.message)
    }
    return c.json(
      {
        error: ERROR_STATUS.SOMETHING_WENT_WRONG,
      },
      500,
    )
  }
}

export const getCurrentUserWeeklyReportHandler: RouteHandler<
  typeof getCurrentUserWeeklyReportRoute,
  AdditionalVariables
> = async (c) => {
  const params = c.req.valid('param')

  try {
    const result = await weeklyReportService.getCurrentUserWeeklyReport(params, c.get('user').id)

    return c.json(result, 200)
  } catch (error) {
    if (error instanceof WeeklyReportServiceError) {
      console.error('WeeklyReportService error:', error.message)
    }
    return c.json(
      {
        error: ERROR_STATUS.SOMETHING_WENT_WRONG,
      },
      500,
    )
  }
}

export const getLastWeekReportHandler: RouteHandler<
  typeof getLastWeekReportRoute,
  AdditionalVariables
> = async (c) => {
  const params = c.req.valid('param')

  try {
    const result = await weeklyReportService.getLastWeekReport(params, c.get('user').id)

    return c.json(result, 200)
  } catch (error) {
    if (error instanceof WeeklyReportServiceError) {
      console.error('WeeklyReportService error:', error.message)
    }
    return c.json(
      {
        error: ERROR_STATUS.SOMETHING_WENT_WRONG,
      },
      500,
    )
  }
}
