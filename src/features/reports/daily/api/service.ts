import type { RouteHandler } from '@hono/zod-openapi'
import type { Session, User } from 'better-auth'
import {
  and,
  count,
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
import type {
  getCountRoute,
  getMineReportsRoute,
  getMineSummaryRoute,
  getReportDetailRoute,
  getTodayReportsRoute,
} from '~/features/reports/daily/api/route'
import { db } from '~/index'
import { dateUtils } from '~/utils/date-utils'

const DEFAULT_SKIP = 0
const DEFAULT_LIMIT = 10

export class DailyReportServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DailyReportServiceError'
  }
}

export class DailyReportService {
  async getTodayReports(
    params: ReturnType<Parameters<RouteHandler<typeof getTodayReportsRoute>>[0]['req']['valid']>,
  ) {
    const { skip, limit, userNames } = params

    const skipNumber = Number(skip) || DEFAULT_SKIP
    const limitNumber = Number(limit) || DEFAULT_LIMIT
    const selectedUserNames = userNames ? userNames.split(',').map((name) => name.trim()) : []

    const { start, end } = dateUtils.getTodayRangeByJST()

    const dateRangeConditions = [
      gte(dailyReports.reportDate, start),
      lte(dailyReports.reportDate, end),
    ]

    const whereConditions =
      selectedUserNames.length > 0
        ? [
            ...dateRangeConditions,
            or(...selectedUserNames.map((name) => like(users.name, `%${name}%`))),
          ]
        : dateRangeConditions

    try {
      const totalDailyReportsCount = await db
        .select({ count: count(dailyReports.id) })
        .from(dailyReports)
        .innerJoin(users, eq(dailyReports.userId, users.id))
        .where(and(...whereConditions))

      const dailyReportsCount = totalDailyReportsCount[0].count

      if (dailyReportsCount === 0) {
        return {
          userReports: [],
          total: dailyReportsCount,
          skip: skipNumber,
          limit: limitNumber,
        }
      }

      const paginatedReportIds = await db
        .select({ id: dailyReports.id })
        .from(dailyReports)
        .innerJoin(users, eq(dailyReports.userId, users.id))
        .where(and(...whereConditions))
        .orderBy(desc(dailyReports.createdAt))
        .limit(limitNumber)
        .offset(skipNumber)

      const dailyReportsWithRelations = await db.query.dailyReports.findMany({
        where: inArray(
          dailyReports.id,
          paginatedReportIds.map(({ id }) => id),
        ),
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

      return {
        userReports: formattedReports,
        total: dailyReportsCount,
        skip: skipNumber,
        limit: limitNumber,
      }
    } catch (error) {
      throw new DailyReportServiceError(
        `Failed to get today reports: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async getMineReports(
    params: ReturnType<Parameters<RouteHandler<typeof getMineReportsRoute>>[0]['req']['valid']>,
    userId: Session['userId'],
    userName: User['name'],
  ) {
    const { skip, limit, startDate, endDate } = params

    const skipNumber = Number(skip) || DEFAULT_SKIP
    const limitNumber = Number(limit) || DEFAULT_LIMIT

    const { start, end } = dateUtils.getOneMonthAgoRangeByJST()

    const startDateUtc = startDate ? dateUtils.convertJstDateToUtc(startDate, 'start') : start
    const endDateUtc = endDate ? dateUtils.convertJstDateToUtc(endDate, 'end') : end

    try {
      const dailyReportsWithRelations = await db.query.dailyReports.findMany({
        where: and(
          eq(dailyReports.userId, userId),
          gte(dailyReports.reportDate, startDateUtc),
          lte(dailyReports.reportDate, endDateUtc),
        ),
        orderBy: desc(dailyReports.reportDate),
        limit: limitNumber,
        offset: skipNumber,
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
        },
      })

      if (dailyReportsWithRelations.length === 0) {
        return {
          myReports: [],
          skip: skipNumber,
          limit: limitNumber,
          startDate,
          endDate,
          userId,
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
          username: userName,
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

      return {
        myReports: formattedReports,
        skip: skipNumber,
        limit: limitNumber,
        startDate,
        endDate,
        userId,
      }
    } catch (error) {
      throw new DailyReportServiceError(
        `Failed to get mine reports: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async getMineSummary(
    params: ReturnType<Parameters<RouteHandler<typeof getMineSummaryRoute>>[0]['req']['valid']>,
    userId: Session['userId'],
  ) {
    const { startDate, endDate, limit, skip } = params

    const skipNumber = Number(skip) || DEFAULT_SKIP
    const limitNumber = Number(limit) || DEFAULT_LIMIT

    const { start, end } = dateUtils.getOneMonthAgoRangeByJST()

    const startDateUtc = startDate ? dateUtils.convertJstDateToUtc(startDate, 'start') : start
    const endDateUtc = endDate ? dateUtils.convertJstDateToUtc(endDate, 'end') : end

    try {
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
        .where(
          and(
            eq(dailyReports.userId, userId),
            gte(dailyReports.reportDate, startDateUtc),
            lte(dailyReports.reportDate, endDateUtc),
          ),
        )
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
        `Failed to get mine summary: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async getCount(
    params: ReturnType<Parameters<RouteHandler<typeof getCountRoute>>[0]['req']['valid']>,
    userId: Session['userId'],
  ) {
    const { kind, startDate, endDate } = params

    const { start, end } = dateUtils.getOneMonthAgoRangeByJST()

    const startDateUtc = startDate ? dateUtils.convertJstDateToUtc(startDate, 'start') : start
    const endDateUtc = endDate ? dateUtils.convertJstDateToUtc(endDate, 'end') : end

    try {
      const baseConditions =
        kind === 'everyone'
          ? and(
              gte(dailyReports.reportDate, startDateUtc),
              lte(dailyReports.reportDate, endDateUtc),
            )
          : and(
              eq(dailyReports.userId, userId),
              gte(dailyReports.reportDate, startDateUtc),
              lte(dailyReports.reportDate, endDateUtc),
            )

      const dailyReportsCountQuery = db
        .select({ count: count(dailyReports.id) })
        .from(dailyReports)
        .where(baseConditions)

      const projectsCountQuery = db
        .select({ count: countDistinct(projects.id) })
        .from(dailyReports)
        .innerJoin(dailyReportMissions, eq(dailyReports.id, dailyReportMissions.dailyReportId))
        .innerJoin(missions, eq(dailyReportMissions.missionId, missions.id))
        .innerJoin(projects, eq(missions.projectId, projects.id))
        .where(baseConditions)

      const totalHoursQuery = db
        .select({
          total: sql<number>`sum(${dailyReportMissions.hours})`.mapWith(Number),
        })
        .from(dailyReportMissions)
        .leftJoin(dailyReports, eq(dailyReportMissions.dailyReportId, dailyReports.id))
        .where(baseConditions)

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

  async getReportDetail(
    params: ReturnType<Parameters<RouteHandler<typeof getReportDetailRoute>>[0]['req']['valid']>,
    userId: Session['userId'],
  ) {
    const reportId = params.id

    try {
      const dailyReportDetailQuery = db.query.dailyReports.findFirst({
        where: and(eq(dailyReports.id, reportId), eq(dailyReports.userId, userId)),
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
        where: and(eq(troubles.userId, userId), eq(troubles.resolved, false)),
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
        `Failed to get report detail: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
