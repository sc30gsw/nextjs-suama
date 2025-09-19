import { endOfDay, format, startOfDay } from 'date-fns'
import { and, desc, eq, gte, lte } from 'drizzle-orm'
import { Hono } from 'hono'
import { dailyReportMissions, dailyReports, missions, projects, troubles, users } from '~/db/schema'
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
          and(gte(dailyReports.reportDate, todayStart), lte(dailyReports.reportDate, todayEnd)),
        )
        .orderBy(desc(dailyReports.createdAt))

      const allReports = await query

      // ユーザー名でフィルタリング
      const filteredReports =
        userNamesArray.length > 0
          ? allReports.filter((report) =>
              userNamesArray.some((name) => report.userName.includes(name)),
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
            workContents: reportMissions.map((mission) => ({
              id: mission.id,
              project: mission.projectName,
              mission: mission.missionName,
              workTime: mission.hours || 0,
              workContent: mission.workContent,
            })),
          }
        }),
      )

      return c.json(
        {
          users: reportsWithMissions,
          total: filteredReports.length,
          skip: skipNumber,
          limit: limitNumber,
        },
        200,
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
      const dateConditions: Parameters<typeof and>[0][] = []

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
        .where(and(eq(dailyReports.userId, userId), ...dateConditions))
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
            workContents: reportMissions.map((mission) => ({
              id: mission.id,
              project: mission.projectName,
              mission: mission.missionName,
              workTime: mission.hours || 0,
              workContent: mission.workContent,
            })),
          }
        }),
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
        200,
      )
    } catch (error) {
      console.error('Error fetching mine reports:', error)
      return c.json({ error: 'Failed to fetch reports' }, 500)
    }
  })
  .get('/:id', sessionMiddleware, async (c) => {
    const reportId = c.req.param('id')
    const userId = c.get('user').id

    try {
      const report = await db.query.dailyReports.findFirst({
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

      // TODO 該当ユーザーの未解決トラブルを取得。withで取得したかったが、テーブル定義にReportIdがないので相談。
      const userTroubles = await db.query.troubles.findMany({
        where: and(eq(troubles.userId, userId), eq(troubles.resolved, false)),
        with: {
          categoryOfTrouble: true,
        },
      })

      if (!report) {
        return c.json({ error: 'Report not found or unauthorized' }, 404)
      }

      const formattedReport = {
        id: report.id,
        reportDate: report.reportDate ? format(new Date(report.reportDate), 'yyyy-MM-dd') : '',
        remote: report.remote,
        impression: report.impression || '',
        reportEntries: report.dailyReportMissions.map((drm) => ({
          id: drm.id,
          project: drm.mission.project.name,
          mission: drm.mission.name,
          projectId: drm.mission.project.id,
          missionId: drm.mission.id,
          content: drm.workContent,
          hours: drm.hours || 0,
        })),
        appealEntries: report.appeals.map((appeal) => ({
          id: appeal.id,
          categoryId: appeal.categoryOfAppealId,
          content: appeal.appeal,
        })),
        troubleEntries: userTroubles.map((trouble) => ({
          id: trouble.id,
          categoryId: trouble.categoryOfTroubleId,
          content: trouble.trouble,
        })),
      }

      return c.json(formattedReport, 200)
    } catch (error) {
      console.error('Error fetching report:', error)
      return c.json({ error: 'Failed to fetch report' }, 500)
    }
  })

export default app
