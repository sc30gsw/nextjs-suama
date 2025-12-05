import type { RouteHandler } from '@hono/zod-openapi'
import type { Session } from 'better-auth'
import { addDays, format, setWeek, setYear, startOfWeek } from 'date-fns'
import { and, eq, exists, gte, inArray, lte, or } from 'drizzle-orm'
import { pipe, sortBy } from 'remeda'
import { QUERY_MAX_LIMIT_VALUES } from '~/constants'
import {
  type dailyReportMissions,
  dailyReports,
  type missions,
  type projects,
  troubles,
  users,
  type weeklyReportMissions,
  weeklyReports,
} from '~/db/schema'
import type {
  getCurrentUserWeeklyReportRoute,
  getLastWeekReportRoute,
  getWeeklyReportByIdRoute,
  getWeeklyReportsRoute,
} from '~/features/reports/weekly/api/route'
import { db } from '~/index'
import { DATE_FORMAT, dateUtils } from '~/utils/date-utils'

export class WeeklyReportServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WeeklyReportServiceError'
  }
}

function groupingReportMission<
  T extends typeof weeklyReportMissions.$inferSelect | typeof dailyReportMissions.$inferSelect,
>(
  reportMissions: Array<
    T &
      Record<
        'mission',
        typeof missions.$inferSelect & {
          project: typeof projects.$inferSelect
        }
      >
  >,
) {
  return pipe(
    reportMissions,
    sortBy([(m) => m.mission.project.name, 'asc']),
    sortBy([(m) => m.mission.name, 'asc']),
  )
}

export class WeeklyReportService {
  async getWeeklyReports(
    params: ReturnType<Parameters<RouteHandler<typeof getWeeklyReportsRoute>>[0]['req']['valid']>,
  ) {
    const { year, week, offset } = params

    const weekStartDate = startOfWeek(setWeek(setYear(new Date(), Number(year)), Number(week)), {
      weekStartsOn: 1,
    })
    const weekEndDate = addDays(weekStartDate, 6)
    const nextWeek = Number(week) + 1

    const startDate = dateUtils.convertJstDateToUtc(format(weekStartDate, DATE_FORMAT), 'start')
    const endDate = dateUtils.convertJstDateToUtc(format(weekEndDate, DATE_FORMAT), 'end')

    const currentWeek = Number(week)

    try {
      const targetUsers = await db.query.users.findMany({
        where: or(
          exists(
            db
              .select()
              .from(weeklyReports)
              .where(
                and(
                  eq(weeklyReports.userId, users.id),
                  eq(weeklyReports.year, Number(year)),
                  eq(weeklyReports.week, currentWeek),
                ),
              ),
          ),
          exists(
            db
              .select()
              .from(dailyReports)
              .where(
                and(
                  eq(dailyReports.userId, users.id),
                  gte(dailyReports.reportDate, startDate),
                  lte(dailyReports.reportDate, endDate),
                ),
              ),
          ),
          exists(
            db
              .select()
              .from(weeklyReports)
              .where(
                and(
                  eq(weeklyReports.userId, users.id),
                  eq(weeklyReports.year, Number(year)),
                  eq(weeklyReports.week, nextWeek),
                ),
              ),
          ),
        ),
        limit: QUERY_MAX_LIMIT_VALUES.WEEKLY_REPORTS,
        offset: Number(offset),
        with: {
          weeklyReports: {
            where: and(
              eq(weeklyReports.year, Number(year)),
              inArray(weeklyReports.week, [currentWeek, nextWeek]),
            ),
            with: {
              weeklyReportMissions: {
                with: {
                  mission: {
                    with: {
                      project: true,
                    },
                  },
                },
              },
            },
          },
          dailyReports: {
            where: and(
              gte(dailyReports.reportDate, startDate),
              lte(dailyReports.reportDate, endDate),
            ),
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
                  categoryOfAppeal: {
                    columns: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          troubles: {
            where: eq(troubles.resolved, false),
            with: {
              categoryOfTrouble: {
                columns: {
                  name: true,
                },
              },
            },
          },
        },
      })

      const reports = targetUsers.map((user) => {
        const lastWeekReports = user.weeklyReports.filter((r) => r.week === currentWeek)
        const nextWeekReports = user.weeklyReports.filter((r) => r.week === nextWeek)

        return {
          user,
          lastWeekReports: lastWeekReports.map((report) => ({
            ...report,
            weeklyReportMissions: groupingReportMission<typeof weeklyReportMissions.$inferSelect>(
              report.weeklyReportMissions,
            ),
          })),
          dailyReports: user.dailyReports.map((report) => ({
            ...report,
            dailyReportMissions: groupingReportMission<typeof dailyReportMissions.$inferSelect>(
              report.dailyReportMissions,
            ),
          })),
          nextWeekReports: nextWeekReports.map((report) => ({
            ...report,
            weeklyReportMissions: groupingReportMission<typeof weeklyReportMissions.$inferSelect>(
              report.weeklyReportMissions,
            ),
          })),
          troubles: user.troubles,
        }
      })

      return { reports, startDate, endDate }
    } catch (error) {
      throw new WeeklyReportServiceError(
        `Failed to get weekly reports: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async getWeeklyReportById(
    params: ReturnType<
      Parameters<RouteHandler<typeof getWeeklyReportByIdRoute>>[0]['req']['valid']
    >,
  ) {
    const { weeklyReportId } = params

    try {
      const weeklyReport = await db.query.weeklyReports.findFirst({
        where: eq(weeklyReports.id, weeklyReportId),
        with: {
          weeklyReportMissions: true,
        },
      })

      return { weeklyReport: weeklyReport || null }
    } catch (error) {
      throw new WeeklyReportServiceError(
        `Failed to get weekly report by id: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async getCurrentUserWeeklyReport(
    params: ReturnType<
      Parameters<RouteHandler<typeof getCurrentUserWeeklyReportRoute>>[0]['req']['valid']
    >,
    userId: Session['userId'],
  ) {
    const { year, week } = params

    try {
      const weeklyReport = await db.query.weeklyReports.findFirst({
        where: and(
          eq(weeklyReports.userId, userId),
          eq(weeklyReports.year, Number(year)),
          eq(weeklyReports.week, Number(week)),
        ),
        with: {
          weeklyReportMissions: true,
        },
      })

      return { weeklyReport: weeklyReport || null }
    } catch (error) {
      throw new WeeklyReportServiceError(
        `Failed to get current user weekly report: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async getLastWeekReport(
    params: ReturnType<Parameters<RouteHandler<typeof getLastWeekReportRoute>>[0]['req']['valid']>,
    userId: Session['userId'],
  ) {
    const { year, week } = params

    try {
      const weeklyReport = await db.query.weeklyReports.findFirst({
        where: and(
          eq(weeklyReports.userId, userId),
          eq(weeklyReports.year, Number(year)),
          eq(weeklyReports.week, Number(week) - 1),
        ),
        with: {
          weeklyReportMissions: {
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

      return { weeklyReport: weeklyReport || null }
    } catch (error) {
      throw new WeeklyReportServiceError(
        `Failed to get last week report: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
