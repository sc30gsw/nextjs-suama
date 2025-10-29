import type { RouteHandler } from '@hono/zod-openapi'
import { addDays, format, setWeek, setYear, startOfWeek } from 'date-fns'
import { and, eq, gte, lte } from 'drizzle-orm'
import { pipe, sortBy } from 'remeda'
import { WEEKLY_REPORTS_LIMIT } from '~/constants'
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

export const getWeeklyReportsHandler: RouteHandler<typeof getWeeklyReportsRoute> = async (c) => {
  // 前週に立てた予定→1つまえの予定
  // 職務内容→今週入力した日報から取得
  // 21週目の場合、前週→21週の予定・職務内容は21週目の日報・次週は22週目
  const { year, week, offset } = c.req.valid('query')

  // 週の開始日を取得（ISO準拠：月曜始まり）
  const weekStartDate = startOfWeek(setWeek(setYear(new Date(), Number(year)), Number(week)), {
    weekStartsOn: 1,
  })
  const weekEndDate = addDays(weekStartDate, 6)

  // JST基準でUTC変換（DBクエリ用）
  const startDate = dateUtils.convertJstDateToUtc(format(weekStartDate, DATE_FORMAT), 'start')
  const endDate = dateUtils.convertJstDateToUtc(format(weekEndDate, DATE_FORMAT), 'end')

  const users = await db.query.users.findMany({
    limit: WEEKLY_REPORTS_LIMIT,
    offset: Number(offset),
  })

  const reports = await Promise.all(
    users.map(async (user) => {
      const [lastWeekReports, dailyReportList, nextWeekReports, troubleList] = await Promise.all([
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

  return c.json({ reports, startDate, endDate }, 200)
}

export const getWeeklyReportByIdHandler: RouteHandler<typeof getWeeklyReportByIdRoute> = async (
  c,
) => {
  const { weeklyReportId } = c.req.valid('param')

  const weeklyReport = await db.query.weeklyReports.findFirst({
    where: eq(weeklyReports.id, weeklyReportId),
    with: {
      weeklyReportMissions: true,
    },
  })

  return c.json({ weeklyReport }, 200)
}

export const getCurrentUserWeeklyReportHandler: RouteHandler<
  typeof getCurrentUserWeeklyReportRoute
> = async (c) => {
  const { year, week } = c.req.valid('param')

  const weeklyReport = await db.query.weeklyReports.findFirst({
    where: and(
      eq(weeklyReports.userId, c.get('user').id),
      eq(weeklyReports.year, Number(year)),
      eq(weeklyReports.week, Number(week)),
    ),
    with: {
      weeklyReportMissions: true,
    },
  })

  return c.json({ weeklyReport }, 200)
}

export const getLastWeekReportHandler: RouteHandler<typeof getLastWeekReportRoute> = async (c) => {
  const { year, week } = c.req.valid('param')

  const weeklyReport = await db.query.weeklyReports.findFirst({
    where: and(
      eq(weeklyReports.userId, c.get('user').id),
      eq(weeklyReports.year, Number(year)),
      eq(weeklyReports.week, Number(week) - 1),
    ),
    with: {
      weeklyReportMissions: {
        with: {
          mission: true,
        },
      },
    },
  })

  return c.json({ weeklyReport }, 200)
}
