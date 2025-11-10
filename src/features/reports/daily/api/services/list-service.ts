import type { RouteHandler } from '@hono/zod-openapi'
import { and, count, desc, eq, gte, inArray, like, lte, or } from 'drizzle-orm'
import { DEFAULT_LIMIT, DEFAULT_SKIP } from '~/constants'
import { dailyReports, users } from '~/db/schema'
import type { getDailyReportsListRoute } from '~/features/reports/daily/api/route'
import { db } from '~/index'
import { dateUtils } from '~/utils/date-utils'

export class DailyReportServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DailyReportServiceError'
  }
}

export class DailyReportListService {
  async getDailyReportsList(
    params: ReturnType<
      Parameters<RouteHandler<typeof getDailyReportsListRoute>>[0]['req']['valid']
    >,
  ) {
    const { userId, userNames, skip, limit, startDate, endDate, today } = params

    const skipNumber = Number(skip) || DEFAULT_SKIP
    const limitNumber = Number(limit) || DEFAULT_LIMIT

    const { start, end } = today
      ? dateUtils.getTodayRangeByJST()
      : dateUtils.getOneMonthAgoRangeByJST()

    const startDateUtc = startDate ? dateUtils.convertJstDateToUtc(startDate, 'start') : start
    const endDateUtc = endDate ? dateUtils.convertJstDateToUtc(endDate, 'end') : end

    const whereConditions = [
      gte(dailyReports.reportDate, startDateUtc),
      lte(dailyReports.reportDate, endDateUtc),
    ]

    userId && whereConditions.push(eq(dailyReports.userId, userId))

    try {
      if (userNames) {
        const selectedUserNames = userNames.split(',').map((name) => name.trim())
        const targetUsers = await db.query.users.findMany({
          where: or(...selectedUserNames.map((word) => like(users.name, `%${word}%`))),
          columns: {
            id: true,
          },
        })

        const targetUserIds = targetUsers.map((user) => user.id)

        whereConditions.push(
          targetUserIds.length > 0
            ? inArray(dailyReports.userId, targetUserIds)
            : eq(dailyReports.userId, ''),
        )
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
          startDate,
          endDate,
          userId,
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
        startDate,
        endDate,
        userId,
        total: totalCount[0].count,
      }
    } catch (error) {
      throw new DailyReportServiceError(
        `Failed to get daily reports list: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
