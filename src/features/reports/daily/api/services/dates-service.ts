import type { RouteHandler } from '@hono/zod-openapi'
import { endOfMonth, format, startOfMonth } from 'date-fns'
import { and, eq, gte, lte, ne } from 'drizzle-orm'
import { dailyReports } from '~/db/schema'
import type { getDailyReportDatesRoute } from '~/features/reports/daily/api/route'
import { db } from '~/index'
import { DATE_FORMAT, dateUtils } from '~/utils/date-utils'

export class DailyReportDatesServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DailyReportDatesServiceError'
  }
}

export class DailyReportDatesService {
  async getDailyReportDates(
    userId: string,
    params: ReturnType<
      Parameters<RouteHandler<typeof getDailyReportDatesRoute>>[0]['req']['valid']
    >,
  ) {
    const { year, month, excludeReportId } = params

    const yearNum = Number(year)
    const monthNum = Number(month)

    const targetDate = new Date(yearNum, monthNum - 1)
    const startDateStr = format(startOfMonth(targetDate), DATE_FORMAT)
    const endDateStr = format(endOfMonth(targetDate), DATE_FORMAT)

    const startDateUtc = dateUtils.convertJstDateToUtc(startDateStr, 'start')
    const endDateUtc = dateUtils.convertJstDateToUtc(endDateStr, 'end')

    const whereConditions = [
      eq(dailyReports.userId, userId),
      gte(dailyReports.reportDate, startDateUtc),
      lte(dailyReports.reportDate, endDateUtc),
    ]

    if (excludeReportId) {
      whereConditions.push(ne(dailyReports.id, excludeReportId))
    }

    try {
      const reports = await db.query.dailyReports.findMany({
        where: and(...whereConditions),
        columns: {
          reportDate: true,
        },
      })

      const dates = reports
        .filter((report) => report.reportDate !== null)
        .map((report) =>
          dateUtils.formatDateByJST(report.reportDate ? report.reportDate : new Date()),
        )

      return { dates }
    } catch (error) {
      throw new DailyReportDatesServiceError(
        `Failed to get daily report dates: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
