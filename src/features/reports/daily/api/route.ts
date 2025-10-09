import { endOfDay, format, startOfDay } from 'date-fns'
import { and, count, desc, eq, gte, inArray, like, lte, or } from 'drizzle-orm'
import { Hono } from 'hono'
import { dailyReports, troubles, users } from '~/db/schema'
import { db } from '~/index'
import { sessionMiddleware } from '~/lib/session-middleware'
import { convertJstDateToUtc } from '~/utils/date-utils'

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

    // WHERE句の基本条件
    const baseConditions = [
      gte(dailyReports.reportDate, todayStart),
      lte(dailyReports.reportDate, todayEnd),
    ]

    // ユーザー名フィルタリング条件を含めたWHERE句を構築
    const whereConditions =
      userNamesArray.length > 0
        ? [...baseConditions, or(...userNamesArray.map((name) => like(users.name, `%${name}%`)))]
        : baseConditions

    try {
      // フィルタリングされた全件数を取得
      const totalQuery = db
        .select({ count: count(dailyReports.id) })
        .from(dailyReports)
        .innerJoin(users, eq(dailyReports.userId, users.id))
        .where(and(...whereConditions))

      const totalResult = await totalQuery
      const totalFilteredReports = totalResult[0].count

      const reportIdsQuery = db
        .select({ id: dailyReports.id })
        .from(dailyReports)
        .innerJoin(users, eq(dailyReports.userId, users.id))
        .where(and(...whereConditions))
        .orderBy(desc(dailyReports.createdAt))
        .limit(limitNumber)
        .offset(skipNumber)

      const reportIds = await reportIdsQuery

      // レポートが見つからない場合は早期リターン
      if (reportIds.length === 0) {
        return c.json(
          {
            users: [],
            total: totalFilteredReports,
            skip: skipNumber,
            limit: limitNumber,
          },
          200,
        )
      }

      // 関連データを取得
      const reports = await db.query.dailyReports.findMany({
        where: inArray(
          dailyReports.id,
          reportIds.map((reportId) => reportId.id),
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

      const reportsWithMissions = reports.map((report) => {
        const totalHours = report.dailyReportMissions.reduce(
          (sum, mission) => sum + (mission.hours || 0),
          0,
        )

        return {
          id: report.id,
          date: format(report.reportDate || new Date(), 'yyyy-MM-dd'),
          username: report.user.name,
          totalHour: totalHours,
          impression: report.impression || '',
          isRemote: report.remote,
          isTurnedIn: report.release,
          userId: report.userId,
          workContents: report.dailyReportMissions.map((mission) => ({
            id: mission.id,
            project: mission.mission.project.name,
            mission: mission.mission.name,
            workTime: mission.hours || 0,
            workContent: mission.workContent,
          })),
        }
      })

      return c.json(
        {
          users: reportsWithMissions,
          total: totalFilteredReports,
          skip: skipNumber,
          limit: limitNumber,
        },
        200,
      )
    } catch (error) {
      console.error('Error fetching today reports:', error)

      return c.json({ error: 'Failed to fetch today reports' }, 500)
    }
  })
  .get('/mine', sessionMiddleware, async (c) => {
    const { skip, limit, startDate, endDate } = c.req.query()
    const userId = c.get('user').id

    const skipNumber = Number(skip) || 0
    const limitNumber = Number(limit) || 10

    // デフォルト値設定（前月〜今日）
    const today = new Date()
    const defaultStartDate = convertJstDateToUtc(
      format(new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()), 'yyyy-MM-dd'),
      'start',
    )
    const defaultEndDate = convertJstDateToUtc(format(today, 'yyyy-MM-dd'), 'start')

    // 日付範囲の条件を構築
    const start = startDate ? convertJstDateToUtc(startDate, 'start') : defaultStartDate
    const end = endDate ? convertJstDateToUtc(endDate, 'start') : defaultEndDate

    try {
      // フィルタリングされた全件数を取得
      const totalQuery = db
        .select({ count: count(dailyReports.id) })
        .from(dailyReports)
        .where(
          and(
            eq(dailyReports.userId, userId),
            gte(dailyReports.reportDate, start),
            lte(dailyReports.reportDate, end),
          ),
        )

      const totalResult = await totalQuery
      const totalFilteredReports = totalResult[0].count

      const reportIdsQuery = db
        .select({ id: dailyReports.id })
        .from(dailyReports)
        .where(
          and(
            eq(dailyReports.userId, userId),
            gte(dailyReports.reportDate, start),
            lte(dailyReports.reportDate, end),
          ),
        )
        .orderBy(desc(dailyReports.reportDate))
        .limit(limitNumber)
        .offset(skipNumber)

      const reportIds = await reportIdsQuery

      // レポートが見つからない場合は早期リターン
      if (reportIds.length === 0) {
        return c.json(
          {
            users: [],
            total: totalFilteredReports,
            skip: skipNumber,
            limit: limitNumber,
            startDate,
            endDate,
            userId,
          },
          200,
        )
      }

      // 関連データを取得
      const reports = await db.query.dailyReports.findMany({
        where: inArray(
          dailyReports.id,
          reportIds.map((r) => r.id),
        ),
        orderBy: desc(dailyReports.reportDate),
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

      const reportsWithMissions = reports.map((report) => {
        const totalHours = report.dailyReportMissions.reduce(
          (sum, mission) => sum + (mission.hours || 0),
          0,
        )

        return {
          id: report.id,
          date: format(report.reportDate || new Date(), 'yyyy-MM-dd'),
          username: report.user.name,
          totalHour: totalHours,
          impression: report.impression || '',
          isRemote: report.remote,
          isTurnedIn: report.release,
          userId: report.userId,
          workContents: report.dailyReportMissions.map((mission) => ({
            id: mission.id,
            project: mission.mission.project.name,
            mission: mission.mission.name,
            workTime: mission.hours || 0,
            workContent: mission.workContent,
          })),
        }
      })

      return c.json(
        {
          users: reportsWithMissions,
          total: totalFilteredReports,
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

      return c.json({ error: 'Failed to fetch mine reports' }, 500)
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
        reportEntries: report.dailyReportMissions.map((dailyReportMissions) => ({
          id: dailyReportMissions.id,
          project: dailyReportMissions.mission.project.name,
          mission: dailyReportMissions.mission.name,
          projectId: dailyReportMissions.mission.project.id,
          missionId: dailyReportMissions.mission.id,
          content: dailyReportMissions.workContent,
          hours: dailyReportMissions.hours || 0,
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
      console.error('Error fetching individual report:', error)

      return c.json({ error: 'Failed to fetch individual report' }, 500)
    }
  })

export default app
