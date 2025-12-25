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
import { db } from '~/index'
import { DATE_FORMAT, dateUtils } from '~/utils/date-utils'
import type { WeeklyReportModel } from '~/features/reports/weekly/api/model'
import {
  WeeklyReportServiceError,
  WeeklyReportNotFoundError,
} from '~/features/reports/weekly/api/errors'

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

export abstract class WeeklyReportService {
  static async getWeeklyReports(params: WeeklyReportModel.getWeeklyReportsQuery) {
    try {
      const { year, week, offset } = params

      const weekStartDate = startOfWeek(setWeek(setYear(new Date(), Number(year)), Number(week)), {
        weekStartsOn: 1,
      })
      const weekEndDate = addDays(weekStartDate, 6)
      const nextWeek = Number(week) + 1

      const startDate = dateUtils.convertJstDateToUtc(format(weekStartDate, DATE_FORMAT), 'start')
      const endDate = dateUtils.convertJstDateToUtc(format(weekEndDate, DATE_FORMAT), 'end')

      const currentWeek = Number(week)
      const targetUsers = await db.query.users.findMany({
        where: and(
          eq(users.isRetired, false),
          or(
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
        ),
        limit: QUERY_MAX_LIMIT_VALUES.WEEKLY_REPORTS,
        offset: Number(offset),
        orderBy: (usersTable, { desc }) => [desc(usersTable.createdAt)],
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
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image,
            createdAt: dateUtils.formatDateByJST(user.createdAt),
            updatedAt: user.updatedAt ? dateUtils.formatDateByJST(user.updatedAt) : null,
          },
          lastWeekReports: lastWeekReports.map((report) => ({
            ...report,
            createdAt: dateUtils.formatDateByJST(report.createdAt),
            updatedAt: report.updatedAt ? dateUtils.formatDateByJST(report.updatedAt) : null,
            weeklyReportMissions: groupingReportMission<typeof weeklyReportMissions.$inferSelect>(
              report.weeklyReportMissions,
            ).map((reportMission) => ({
              ...reportMission,
              createdAt: dateUtils.formatDateByJST(reportMission.createdAt),
              updatedAt: reportMission.updatedAt
                ? dateUtils.formatDateByJST(reportMission.updatedAt)
                : null,
              mission: {
                ...reportMission.mission,
                createdAt: dateUtils.formatDateByJST(reportMission.mission.createdAt),
                updatedAt: reportMission.mission.updatedAt
                  ? dateUtils.formatDateByJST(reportMission.mission.updatedAt)
                  : null,
                project: {
                  ...reportMission.mission.project,
                  createdAt: dateUtils.formatDateByJST(reportMission.mission.project.createdAt),
                  updatedAt: reportMission.mission.project.updatedAt
                    ? dateUtils.formatDateByJST(reportMission.mission.project.updatedAt)
                    : null,
                },
              },
            })),
          })),
          dailyReports: user.dailyReports.map((report) => ({
            ...report,
            reportDate: report.reportDate ? dateUtils.formatDateByJST(report.reportDate) : null,
            createdAt: dateUtils.formatDateByJST(report.createdAt),
            updatedAt: report.updatedAt ? dateUtils.formatDateByJST(report.updatedAt) : null,
            dailyReportMissions: groupingReportMission<typeof dailyReportMissions.$inferSelect>(
              report.dailyReportMissions,
            ).map((reportMission) => ({
              ...reportMission,
              createdAt: dateUtils.formatDateByJST(reportMission.createdAt),
              updatedAt: reportMission.updatedAt
                ? dateUtils.formatDateByJST(reportMission.updatedAt)
                : null,
              mission: {
                ...reportMission.mission,
                createdAt: dateUtils.formatDateByJST(reportMission.mission.createdAt),
                updatedAt: reportMission.mission.updatedAt
                  ? dateUtils.formatDateByJST(reportMission.mission.updatedAt)
                  : null,
                project: {
                  ...reportMission.mission.project,
                  createdAt: dateUtils.formatDateByJST(reportMission.mission.project.createdAt),
                  updatedAt: reportMission.mission.project.updatedAt
                    ? dateUtils.formatDateByJST(reportMission.mission.project.updatedAt)
                    : null,
                },
              },
            })),
            appeals: report.appeals.map((appeal) => ({
              ...appeal,
              createdAt: dateUtils.formatDateByJST(appeal.createdAt),
              updatedAt: appeal.updatedAt ? dateUtils.formatDateByJST(appeal.updatedAt) : null,
            })),
          })),
          nextWeekReports: nextWeekReports.map((report) => ({
            ...report,
            createdAt: dateUtils.formatDateByJST(report.createdAt),
            updatedAt: report.updatedAt ? dateUtils.formatDateByJST(report.updatedAt) : null,
            weeklyReportMissions: groupingReportMission<typeof weeklyReportMissions.$inferSelect>(
              report.weeklyReportMissions,
            ).map((reportMission) => ({
              ...reportMission,
              createdAt: dateUtils.formatDateByJST(reportMission.createdAt),
              updatedAt: reportMission.updatedAt
                ? dateUtils.formatDateByJST(reportMission.updatedAt)
                : null,
              mission: {
                ...reportMission.mission,
                createdAt: dateUtils.formatDateByJST(reportMission.mission.createdAt),
                updatedAt: reportMission.mission.updatedAt
                  ? dateUtils.formatDateByJST(reportMission.mission.updatedAt)
                  : null,
                project: {
                  ...reportMission.mission.project,
                  createdAt: dateUtils.formatDateByJST(reportMission.mission.project.createdAt),
                  updatedAt: reportMission.mission.project.updatedAt
                    ? dateUtils.formatDateByJST(reportMission.mission.project.updatedAt)
                    : null,
                },
              },
            })),
          })),
          troubles: user.troubles.map((trouble) => ({
            ...trouble,
            createdAt: dateUtils.formatDateByJST(trouble.createdAt),
            updatedAt: trouble.updatedAt ? dateUtils.formatDateByJST(trouble.updatedAt) : null,
          })),
        }
      })

      return {
        reports,
        startDate: dateUtils.formatDateByJST(startDate),
        endDate: dateUtils.formatDateByJST(endDate),
      }
    } catch (error) {
      if (error instanceof WeeklyReportServiceError || error instanceof WeeklyReportNotFoundError) {
        throw error
      }
      throw new WeeklyReportServiceError(
        `Failed to get weekly reports: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  static async getWeeklyReportById(params: WeeklyReportModel.getWeeklyReportByIdParams) {
    try {
      const { weeklyReportId } = params
      const weeklyReport = await db.query.weeklyReports.findFirst({
        where: eq(weeklyReports.id, weeklyReportId),
        with: {
          weeklyReportMissions: true,
        },
      })

      if (!weeklyReport) {
        return { weeklyReport: null }
      }

      return {
        weeklyReport: {
          ...weeklyReport,
          createdAt: dateUtils.formatDateByJST(weeklyReport.createdAt),
          updatedAt: weeklyReport.updatedAt
            ? dateUtils.formatDateByJST(weeklyReport.updatedAt)
            : null,
          weeklyReportMissions: weeklyReport.weeklyReportMissions.map((mission) => ({
            ...mission,
            createdAt: dateUtils.formatDateByJST(mission.createdAt),
            updatedAt: mission.updatedAt ? dateUtils.formatDateByJST(mission.updatedAt) : null,
          })),
        },
      }
    } catch (error) {
      if (error instanceof WeeklyReportServiceError || error instanceof WeeklyReportNotFoundError) {
        throw error
      }
      throw new WeeklyReportServiceError(
        `Failed to get weekly report by id: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  static async getCurrentUserWeeklyReport(
    params: WeeklyReportModel.getCurrentUserWeeklyReportParams,
    userId: Session['userId'],
  ) {
    try {
      const { year, week } = params
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

      if (!weeklyReport) {
        return { weeklyReport: null }
      }

      return {
        weeklyReport: {
          ...weeklyReport,
          createdAt: dateUtils.formatDateByJST(weeklyReport.createdAt),
          updatedAt: weeklyReport.updatedAt
            ? dateUtils.formatDateByJST(weeklyReport.updatedAt)
            : null,
          weeklyReportMissions: weeklyReport.weeklyReportMissions.map((mission) => ({
            ...mission,
            createdAt: dateUtils.formatDateByJST(mission.createdAt),
            updatedAt: mission.updatedAt ? dateUtils.formatDateByJST(mission.updatedAt) : null,
          })),
        },
      }
    } catch (error) {
      if (error instanceof WeeklyReportServiceError || error instanceof WeeklyReportNotFoundError) {
        throw error
      }
      throw new WeeklyReportServiceError(
        `Failed to get current user weekly report: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  static async getLastWeekReport(
    params: WeeklyReportModel.getLastWeekReportParams,
    userId: Session['userId'],
  ) {
    try {
      const { year, week } = params
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

      if (!weeklyReport) {
        return { weeklyReport: null }
      }

      return {
        weeklyReport: {
          ...weeklyReport,
          createdAt: dateUtils.formatDateByJST(weeklyReport.createdAt),
          updatedAt: weeklyReport.updatedAt
            ? dateUtils.formatDateByJST(weeklyReport.updatedAt)
            : null,
          weeklyReportMissions: weeklyReport.weeklyReportMissions.map((mission) => ({
            ...mission,
            createdAt: dateUtils.formatDateByJST(mission.createdAt),
            updatedAt: mission.updatedAt ? dateUtils.formatDateByJST(mission.updatedAt) : null,
            mission: {
              ...mission.mission,
              createdAt: dateUtils.formatDateByJST(mission.mission.createdAt),
              updatedAt: mission.mission.updatedAt
                ? dateUtils.formatDateByJST(mission.mission.updatedAt)
                : null,
              project: {
                ...mission.mission.project,
                createdAt: dateUtils.formatDateByJST(mission.mission.project.createdAt),
                updatedAt: mission.mission.project.updatedAt
                  ? dateUtils.formatDateByJST(mission.mission.project.updatedAt)
                  : null,
              },
            },
          })),
        },
      }
    } catch (error) {
      if (error instanceof WeeklyReportServiceError || error instanceof WeeklyReportNotFoundError) {
        throw error
      }
      throw new WeeklyReportServiceError(
        `Failed to get last week report: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
