import type { RouteHandler } from '@hono/zod-openapi'
import {
  and,
  countDistinct,
  desc,
  eq,
  gte,
  inArray,
  like,
  lte,
  max,
  min,
  or,
  sql,
} from 'drizzle-orm'
import { PAGINATION } from '~/constants/pagination'
import { dailyReportMissions, dailyReports, missions, projects, users } from '~/db/schema'
import type { getDailyReportSummaryRoute } from '~/features/reports/daily/api/route'
import { db } from '~/index'
import { dateUtils } from '~/utils/date-utils'
import { DailyReportServiceError } from './list-service'

export class DailyReportSummaryService {
  async getDailyReportSummary(
    params: ReturnType<
      Parameters<RouteHandler<typeof getDailyReportSummaryRoute>>[0]['req']['valid']
    >,
  ) {
    const { userId, userNames, startDate, endDate, limit, skip } = params

    const skipNumber = Number(skip) || PAGINATION.PARAMS.DEFAULT_SKIP
    const limitNumber = Number(limit) || PAGINATION.PARAMS.DEFAULT_LIMIT

    const { start, end } = dateUtils.getOneMonthAgoRangeByJST()

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

      const projectSummaries = await db
        .select({
          projectId: projects.id,
          projectName: projects.name,
          totalHours: sql<number>`sum(${dailyReportMissions.hours})`.mapWith(Number),
          workDays: countDistinct(dailyReports.reportDate),
          firstWorkDate: min(dailyReports.reportDate),
          lastWorkDate: max(dailyReports.reportDate),
        })
        .from(dailyReports)
        .innerJoin(dailyReportMissions, eq(dailyReports.id, dailyReportMissions.dailyReportId))
        .innerJoin(missions, eq(dailyReportMissions.missionId, missions.id))
        .innerJoin(projects, eq(missions.projectId, projects.id))
        .where(and(...whereConditions))
        .groupBy(projects.id, projects.name)
        .orderBy(desc(sql<number>`sum(${dailyReportMissions.hours})`))
        .limit(limitNumber)
        .offset(skipNumber)

      const formattedProjectSummaries = projectSummaries.map((item) => ({
        ...item,
        firstWorkDate: item.firstWorkDate ? new Date(item.firstWorkDate).toISOString() : null,
        lastWorkDate: item.lastWorkDate ? new Date(item.lastWorkDate).toISOString() : null,
        averageHoursPerDay: item.workDays > 0 ? item.totalHours / item.workDays : 0,
      }))

      return { summary: formattedProjectSummaries }
    } catch (error) {
      throw new DailyReportServiceError(
        `Failed to get daily report summary: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
