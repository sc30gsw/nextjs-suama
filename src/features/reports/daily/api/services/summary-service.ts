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
import { QUERY_DEFAULT_PARAMS } from '~/constants'
import { dailyReportMissions, dailyReports, missions, projects, users } from '~/db/schema'
import { db } from '~/index'
import { dateUtils } from '~/utils/date-utils'
import type { DailyReportModel } from '~/features/reports/daily/api/model'
import { DailyReportServiceError } from '~/features/reports/daily/api/errors'

export abstract class DailyReportSummaryService {
  static async getDailyReportSummary(params: DailyReportModel.getDailyReportSummaryQuery) {
    try {
      const { userId, userNames, startDate, endDate, limit, skip } = params

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
          return { summaries: [] }
        }

        whereConditions.push(inArray(dailyReports.userId, targetUserIds))
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

      return { summaries: formattedProjectSummaries }
    } catch (error) {
      if (error instanceof DailyReportServiceError) {
        throw error
      }
      throw new DailyReportServiceError(
        `Failed to get daily report summary: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
