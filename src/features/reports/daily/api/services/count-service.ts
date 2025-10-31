import type { RouteHandler } from '@hono/zod-openapi'
import type { Session } from 'better-auth'
import { and, count, countDistinct, eq, gte, inArray, like, lte, or, sql } from 'drizzle-orm'
import { dailyReportMissions, dailyReports, missions, projects, users } from '~/db/schema'
import type { getCountRoute } from '~/features/reports/daily/api/route'
import { db } from '~/index'
import { dateUtils } from '~/utils/date-utils'
import { DailyReportServiceError } from './list-service'

const DEFAULT_SKIP = 0
const DEFAULT_LIMIT = 10

export class DailyReportCountService {
  async getCount(
    params: ReturnType<Parameters<RouteHandler<typeof getCountRoute>>[0]['req']['valid']>,
    authenticatedUserId: Session['userId'],
  ) {
    const { userId: queryUserId, userNames, startDate, endDate } = params

    const { start, end } = dateUtils.getOneMonthAgoRangeByJST()

    const startDateUtc = startDate ? dateUtils.convertJstDateToUtc(startDate, 'start') : start
    const endDateUtc = endDate ? dateUtils.convertJstDateToUtc(endDate, 'end') : end

    try {
      const whereConditions = [
        gte(dailyReports.reportDate, startDateUtc),
        lte(dailyReports.reportDate, endDateUtc),
      ]

      if (queryUserId) {
        whereConditions.push(eq(dailyReports.userId, queryUserId))
      }

      // userNames でフィルタリング（部分一致）
      if (userNames) {
        const userNamesArray = userNames.split(',').map((name) => name.trim())
        const targetUsers = await db.query.users.findMany({
          where: or(...userNamesArray.flatMap((word) => [like(users.name, `%${word}%`)])),
          columns: {
            id: true,
          },
        })

        const targetUserIds = targetUsers.map((user) => user.id)
        if (targetUserIds.length > 0) {
          whereConditions.push(inArray(dailyReports.userId, targetUserIds))
        }
      }

      const dailyReportsCountQuery = db
        .select({ count: count(dailyReports.id) })
        .from(dailyReports)
        .where(and(...whereConditions))

      const projectsCountQuery = db
        .select({ count: countDistinct(projects.id) })
        .from(dailyReports)
        .innerJoin(dailyReportMissions, eq(dailyReports.id, dailyReportMissions.dailyReportId))
        .innerJoin(missions, eq(dailyReportMissions.missionId, missions.id))
        .innerJoin(projects, eq(missions.projectId, projects.id))
        .where(and(...whereConditions))

      const totalHoursQuery = db
        .select({
          total: sql<number>`sum(${dailyReportMissions.hours})`.mapWith(Number),
        })
        .from(dailyReportMissions)
        .leftJoin(dailyReports, eq(dailyReportMissions.dailyReportId, dailyReports.id))
        .where(and(...whereConditions))

      const [dailyReportsCount, projectsCount, totalHours] = await Promise.all([
        dailyReportsCountQuery,
        projectsCountQuery,
        totalHoursQuery,
      ])

      return {
        dailyReportsCount: dailyReportsCount[0].count,
        projectsCount: projectsCount[0].count,
        totalHours: totalHours[0].total ?? 0,
      }
    } catch (error) {
      throw new DailyReportServiceError(
        `Failed to get count: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
