import { and, count, desc, eq, gte, inArray, like, lte, or } from 'drizzle-orm'
import { QUERY_DEFAULT_PARAMS } from '~/constants'
import { dailyReports, users } from '~/db/schema'
import { getDb } from '~/index'
import { dateUtils } from '~/utils/date-utils'
import type { DailyReportModel } from '~/features/reports/daily/api/model'
import { DailyReportServiceError } from '~/features/reports/daily/api/errors'

export abstract class DailyReportListService {
  static async getDailyReportsList(params: DailyReportModel.getDailyReportsQuery) {
    try {
      const db = getDb()
      const { userId, userNames, skip, limit, startDate, endDate } = params

      const skipNumber = Number(skip) || QUERY_DEFAULT_PARAMS.SKIP
      const limitNumber = Number(limit) || QUERY_DEFAULT_PARAMS.LIMIT

      const { start, end } = dateUtils.getOneMonthAgoRangeByJST()

      const startDateUtc = startDate ? dateUtils.convertJstDateToUtc(startDate, 'start') : start
      const endDateUtc = endDate ? dateUtils.convertJstDateToUtc(endDate, 'end') : end

      const whereConditions = [
        gte(dailyReports.reportDate, startDateUtc),
        lte(dailyReports.reportDate, endDateUtc),
      ]

      if (userId) {
        whereConditions.push(eq(dailyReports.userId, userId))
      } else {
        whereConditions.push(eq(dailyReports.release, true))
      }
      if (userNames) {
        const selectedUserNames = userNames.split(',').map((name) => name.trim())
        const targetUsers = await db.query.users.findMany({
          where: or(...selectedUserNames.map((word) => like(users.name, `%${word}%`))),
          columns: {
            id: true,
          },
        })

        const targetUserIds = targetUsers.map((user) => user.id)

        if (targetUserIds.length === 0) {
          return {
            dailyReports: [],
            skip: skipNumber,
            limit: limitNumber,
            startDate: startDate ?? dateUtils.formatDateByJST(start),
            endDate: endDate ?? dateUtils.formatDateByJST(end),
            userId: userId ?? '',
            total: 0,
          }
        }

        whereConditions.push(inArray(dailyReports.userId, targetUserIds))
      }

      const dailyReportsWithRelations = await db.query.dailyReports.findMany({
        where: and(...whereConditions),
        orderBy: desc(dailyReports.reportDate),
        limit: limitNumber,
        offset: skipNumber,
        with: {
          user: true,
          dailyReportMissions: {
            with: {
              mission: {
                with: {
                  project: true,
                },
              },
            },
          },
        },
      })

      if (dailyReportsWithRelations.length === 0) {
        return {
          dailyReports: [],
          skip: skipNumber,
          limit: limitNumber,
          startDate: startDate ?? dateUtils.formatDateByJST(start),
          endDate: endDate ?? dateUtils.formatDateByJST(end),
          userId: userId ?? '',
          total: 0,
        }
      }

      const formattedReports = dailyReportsWithRelations.map((report) => {
        const totalHours = report.dailyReportMissions.reduce(
          (sum, mission) => sum + (mission.hours ?? 0),
          0,
        )

        return {
          id: report.id,
          date: dateUtils.formatDateByJST(report.reportDate ?? new Date()),
          username: report.user.name,
          totalHour: totalHours,
          impression: report.impression ?? '',
          isRemote: report.remote,
          isTurnedIn: report.release,
          userId: report.userId,
          workContents: report.dailyReportMissions.map((mission) => ({
            id: mission.id,
            project: mission.mission.project.name,
            mission: mission.mission.name,
            workTime: mission.hours ?? 0,
            workContent: mission.workContent,
          })),
        }
      })

      const totalCount = await db
        .select({ count: count(dailyReports.id) })
        .from(dailyReports)
        .where(and(...whereConditions))

      return {
        dailyReports: formattedReports,
        skip: skipNumber,
        limit: limitNumber,
        startDate: startDate ?? dateUtils.formatDateByJST(start),
        endDate: endDate ?? dateUtils.formatDateByJST(end),
        userId: userId ?? '',
        total: totalCount[0].count,
      }
    } catch (error) {
      if (error instanceof DailyReportServiceError) {
        throw error
      }

      throw new DailyReportServiceError(
        `Failed to get daily reports list: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
