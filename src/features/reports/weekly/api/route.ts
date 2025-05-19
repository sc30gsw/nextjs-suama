import { addDays, setWeek, setYear, startOfWeek } from 'date-fns'
import { and, eq, gte, lte } from 'drizzle-orm'
import { Hono } from 'hono'
import { dailyReports, troubles, weeklyReports } from '~/db/schema'
import { db } from '~/index'
import { sessionMiddleware } from '~/lib/session-middleware'

const app = new Hono()
  .get('/', sessionMiddleware, async (c) => {
    // 前週に立てた予定→1つまえの予定
    // 職務内容→今週入力した日報から取得
    // 21週目の場合、前週→21週の予定・職務内容は21週目の日報・次週は22週目
    const { year, week, offset } = c.req.query()

    // 週の開始日を取得（ISO準拠：月曜始まり）
    const startDate = startOfWeek(
      setWeek(setYear(new Date(), Number(year)), Number(week)),
      {
        weekStartsOn: 1,
      },
    )
    const endDate = addDays(startDate, 6)

    const users = await db.query.users.findMany({
      limit: 30,
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
              where: and(
                eq(troubles.userId, user.id),
                eq(troubles.resolved, false),
              ),
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
          lastWeekReports,
          dailyReports: dailyReportList,
          nextWeekReports,
          troubles: troubleList,
        }
      }),
    )

    return c.json({ reports, startDate, endDate }, 200)
  })
  .get('/current-user/:year/:week', sessionMiddleware, async (c) => {
    const { year, week } = c.req.param()

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
  })

export default app
