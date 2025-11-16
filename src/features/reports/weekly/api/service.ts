import type { RouteHandler } from '@hono/zod-openapi'
import type { Session } from 'better-auth'
import { addDays, format, setWeek, setYear, startOfWeek } from 'date-fns'
import { and, eq, gte, lte } from 'drizzle-orm'
import { pipe, sortBy } from 'remeda'
import { QUERY_MAX_LIMIT_VALUES } from '~/constants'
import {
  type dailyReportMissions,
  dailyReports,
  type missions,
  type projects,
  troubles,
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
    sortBy([(m) => m.mission.name, 'asc']),
    sortBy([(m) => m.mission.project.name, 'asc']),
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

    const startDate = dateUtils.convertJstDateToUtc(format(weekStartDate, DATE_FORMAT), 'start')
    const endDate = dateUtils.convertJstDateToUtc(format(weekEndDate, DATE_FORMAT), 'end')

    try {
      const users = await db.query.users.findMany({
        limit: QUERY_MAX_LIMIT_VALUES.WEEKLY_REPORTS,
        offset: Number(offset),
      })

      const reports = await Promise.all(
        users.map(async (user) => {
          const [lastWeekReports, dailyReportList, nextWeekReports, troubleList] =
            await Promise.all([
              db.query.weeklyReports.findMany({
                where: and(
                  eq(weeklyReports.userId, user.id),
                  eq(weeklyReports.year, Number(year)),
                  eq(weeklyReports.week, Number(week)),
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
              }),
              db.query.dailyReports.findMany({
                where: and(
                  eq(dailyReports.userId, user.id),
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
              }),
              db.query.weeklyReports.findMany({
                where: and(
                  eq(weeklyReports.userId, user.id),
                  eq(weeklyReports.year, Number(year)),
                  eq(weeklyReports.week, Number(week) + 1),
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
              }),
              db.query.troubles.findMany({
                where: and(eq(troubles.userId, user.id), eq(troubles.resolved, false)),
                with: {
                  categoryOfTrouble: {
                    columns: {
                      name: true,
                    },
                  },
                },
              }),
            ])

          return {
            user,
            lastWeekReports: lastWeekReports.map((report) => ({
              ...report,
              weeklyReportMissions: groupingReportMission<typeof weeklyReportMissions.$inferSelect>(
                report.weeklyReportMissions,
              ),
            })),
            dailyReports: dailyReportList.map((report) => ({
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
            troubles: troubleList,
          }
        }),
      )

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
