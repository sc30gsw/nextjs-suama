import type { RouteHandler } from '@hono/zod-openapi'
import type { Session } from 'better-auth'
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
import { dailyReportMissions, dailyReports, missions, projects, troubles, users } from '~/db/schema'
import type { getDailyReportSummaryRoute } from '~/features/reports/daily/api/route'
import { db } from '~/index'
import { dateUtils } from '~/utils/date-utils'
import { DailyReportServiceError } from './list-service'

const DEFAULT_SKIP = 0
const DEFAULT_LIMIT = 10

export class DailyReportDetailService {
  async getDailyReportSummary(
    params: ReturnType<
      Parameters<RouteHandler<typeof getDailyReportSummaryRoute>>[0]['req']['valid']
    >,
  ) {
    const { userId: queryUserId, userNames, startDate, endDate, limit, skip } = params

    const skipNumber = Number(skip) || DEFAULT_SKIP
    const limitNumber = Number(limit) || DEFAULT_LIMIT

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

  async getDailyReportDetail(
    params: { id: string; userId?: string },
    authenticatedUserId: Session['userId'],
  ) {
    const reportId = params.id
    const queryUserId = params.userId

    try {
      const targetUserId = queryUserId || authenticatedUserId

      const dailyReportDetailQuery = db.query.dailyReports.findFirst({
        where: and(eq(dailyReports.id, reportId), eq(dailyReports.userId, targetUserId)),
        with: {
          dailyReportMissions: {
            with: {
              mission: {
                with: {
                  project: true,
                },
              },
            },
          },
          appeals: {
            with: {
              categoryOfAppeal: true,
            },
          },
        },
      })

      const unresolvedTroublesQuery = db.query.troubles.findMany({
        where: and(eq(troubles.userId, targetUserId), eq(troubles.resolved, false)),
        with: {
          categoryOfTrouble: true,
        },
      })

      const [dailyReportDetail, unresolvedTroubles] = await Promise.all([
        dailyReportDetailQuery,
        unresolvedTroublesQuery,
      ])

      if (!dailyReportDetail) {
        return null
      }

      return {
        id: dailyReportDetail.id,
        reportDate: dailyReportDetail.reportDate
          ? dateUtils.formatDateByJST(dailyReportDetail.reportDate ?? new Date())
          : '',
        remote: dailyReportDetail.remote,
        impression: dailyReportDetail.impression ?? '',
        reportEntries: dailyReportDetail.dailyReportMissions.map((dailyReportMission) => ({
          id: dailyReportMission.id,
          project: dailyReportMission.mission.project.name,
          mission: dailyReportMission.mission.name,
          projectId: dailyReportMission.mission.project.id,
          missionId: dailyReportMission.mission.id,
          content: dailyReportMission.workContent,
          hours: dailyReportMission.hours ?? 0,
        })),
        appealEntries: dailyReportDetail.appeals.map((appeal) => ({
          id: appeal.id,
          categoryId: appeal.categoryOfAppealId,
          content: appeal.appeal,
        })),
        troubleEntries: unresolvedTroubles.map((trouble) => ({
          id: trouble.id,
          categoryId: trouble.categoryOfTroubleId,
          content: trouble.trouble,
        })),
      }
    } catch (error) {
      throw new DailyReportServiceError(
        `Failed to get daily report detail: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
