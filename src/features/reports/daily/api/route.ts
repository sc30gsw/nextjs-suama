import { endOfDay, format, startOfDay } from 'date-fns'
import { and, desc, eq, gte, lte } from 'drizzle-orm'
import { Hono } from 'hono'
import { dailyReportMissions, dailyReports, missions, projects, users } from '~/db/schema'
import { db } from '~/index'
import { sessionMiddleware } from '~/lib/session-middleware'

const app = new Hono()
  .get('/today', sessionMiddleware, async (c) => {
    const { skip, limit, userNames } = c.req.query()

    const skipNumber = Number(skip) || 0
    const limitNumber = Number(limit) || 10

    const userNamesArray = userNames ? userNames.split(',').map((name) => name.trim()) : []

    // 本日の日付を取得（日本時間）
    const today = new Date()
    const todayStart = startOfDay(today)
    const todayEnd = endOfDay(today)

    try {
      // 本日の日報を取得
      const query = db
        .select({
          id: dailyReports.id,
          reportDate: dailyReports.reportDate,
          impression: dailyReports.impression,
          remote: dailyReports.remote,
          release: dailyReports.release,
          userName: users.name,
          userId: users.id,
        })
        .from(dailyReports)
        .innerJoin(users, eq(dailyReports.userId, users.id))
        .where(
          and(
            gte(dailyReports.reportDate, todayStart),
            lte(dailyReports.reportDate, todayEnd)
          )
        )
        .orderBy(desc(dailyReports.createdAt))

      const allReports = await query

      // ユーザー名でフィルタリング
      const filteredReports = userNamesArray.length > 0
        ? allReports.filter(report =>
            userNamesArray.some(name => report.userName.includes(name))
          )
        : allReports

      // ページネーション
      const paginatedReports = filteredReports.slice(skipNumber, skipNumber + limitNumber)

      // 各日報の作業内容を取得
      const reportsWithMissions = await Promise.all(
        paginatedReports.map(async (report) => {
          const reportMissions = await db
            .select({
              id: dailyReportMissions.id,
              workContent: dailyReportMissions.workContent,
              hours: dailyReportMissions.hours,
              missionName: missions.name,
              projectName: projects.name,
            })
            .from(dailyReportMissions)
            .innerJoin(missions, eq(dailyReportMissions.missionId, missions.id))
            .innerJoin(projects, eq(missions.projectId, projects.id))
            .where(eq(dailyReportMissions.dailyReportId, report.id))

          const totalHours = reportMissions.reduce((sum, mission) => sum + (mission.hours || 0), 0)

          return {
            id: report.id,
            date: format(report.reportDate || new Date(), 'yyyy-MM-dd'),
            username: report.userName,
            totalHour: totalHours,
            impression: report.impression || '',
            isRemote: report.remote,
            isTurnedIn: report.release,
            userId: report.userId,
            workContents: reportMissions.map(mission => ({
              id: mission.id,
              project: mission.projectName,
              mission: mission.missionName,
              workTime: mission.hours || 0,
              workContent: mission.workContent,
            })),
          }
        })
      )

      return c.json(
        {
          users: reportsWithMissions,
          total: filteredReports.length,
          skip: skipNumber,
          limit: limitNumber,
        },
        200
      )
    } catch (error) {
      console.error('Error fetching today reports:', error)
      return c.json({ error: 'Failed to fetch reports' }, 500)
    }
  })
  .get('/mine', sessionMiddleware, async (c) => {
    const { skip, limit, startDate, endDate } = c.req.query()
    const userId = c.get('user').id

    const skipNumber = Number(skip) || 0
    const limitNumber = Number(limit) || 10

    try {
      // 日付範囲の条件を構築
      const dateConditions = []

      if (startDate) {
        const start = new Date(startDate)
        dateConditions.push(gte(dailyReports.reportDate, start))
      }

      if (endDate) {
        const end = endOfDay(new Date(endDate))
        dateConditions.push(lte(dailyReports.reportDate, end))
      }

      // 自分の日報を取得
      const query = db
        .select({
          id: dailyReports.id,
          reportDate: dailyReports.reportDate,
          impression: dailyReports.impression,
          remote: dailyReports.remote,
          release: dailyReports.release,
          userName: users.name,
          userId: users.id,
        })
        .from(dailyReports)
        .innerJoin(users, eq(dailyReports.userId, users.id))
        .where(
          and(
            eq(dailyReports.userId, userId),
            ...dateConditions
          )
        )
        .orderBy(desc(dailyReports.reportDate))

      const allReports = await query

      // ページネーション
      const paginatedReports = allReports.slice(skipNumber, skipNumber + limitNumber)

      // 各日報の作業内容を取得
      const reportsWithMissions = await Promise.all(
        paginatedReports.map(async (report) => {
          const reportMissions = await db
            .select({
              id: dailyReportMissions.id,
              workContent: dailyReportMissions.workContent,
              hours: dailyReportMissions.hours,
              missionName: missions.name,
              projectName: projects.name,
            })
            .from(dailyReportMissions)
            .innerJoin(missions, eq(dailyReportMissions.missionId, missions.id))
            .innerJoin(projects, eq(missions.projectId, projects.id))
            .where(eq(dailyReportMissions.dailyReportId, report.id))

          const totalHours = reportMissions.reduce((sum, mission) => sum + (mission.hours || 0), 0)

          return {
            id: report.id,
            date: format(report.reportDate || new Date(), 'yyyy-MM-dd'),
            username: report.userName,
            totalHour: totalHours,
            impression: report.impression || '',
            isRemote: report.remote,
            isTurnedIn: report.release,
            userId: report.userId,
            workContents: reportMissions.map(mission => ({
              id: mission.id,
              project: mission.projectName,
              mission: mission.missionName,
              workTime: mission.hours || 0,
              workContent: mission.workContent,
            })),
          }
        })
      )

      return c.json(
        {
          users: reportsWithMissions,
          total: allReports.length,
          skip: skipNumber,
          limit: limitNumber,
          startDate,
          endDate,
          userId,
        },
        200
      )
    } catch (error) {
      console.error('Error fetching mine reports:', error)
      return c.json({ error: 'Failed to fetch reports' }, 500)
    }
  })

export default app
