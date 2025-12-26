import { endOfMonth, format, startOfMonth } from 'date-fns'
import { and, eq, gte, lte, ne } from 'drizzle-orm'
import { dailyReports } from '~/db/schema'
import { getDb } from '~/index'
import { DATE_FORMAT, dateUtils } from '~/utils/date-utils'
import type { DailyReportModel } from '~/features/reports/daily/api/model'
import { DailyReportServiceError } from '~/features/reports/daily/api/errors'

export abstract class DailyReportDatesService {
  static async getDailyReportDates(
    userId: string,
    params: DailyReportModel.getDailyReportDatesQuery,
  ) {
    try {
      const db = getDb()
      const { year, month, excludeReportId } = params

      if (!year || !month) {
        return { dates: [] }
      }

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
      if (error instanceof DailyReportServiceError) {
        throw error
      }
      throw new DailyReportServiceError(
        `Failed to get daily report dates: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
