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
import { Hono } from 'hono'
import { dailyReportMissions, dailyReports, missions, projects, troubles, users } from '~/db/schema'
import { db } from '~/index'
import { sessionMiddleware } from '~/lib/session-middleware'
import { dateUtils } from '~/utils/date-utils'

const app = new Hono()
  .get('/today', sessionMiddleware, async (c) => {
    const { skip, limit, userNames } = c.req.query()

    const skipNumber = Number(skip) ?? 0
    const limitNumber = Number(limit) ?? 10

    const userNamesArray = userNames ? userNames.split(',').map((name) => name.trim()) : []

    // 本日の日付を取得（日本時間）
    const { start: todayStart, end: todayEnd } = dateUtils.getTodayRangeByJST()

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
      const totalCount = await db
        .select({ count: count(dailyReports.id) })
        .from(dailyReports)
        .innerJoin(users, eq(dailyReports.userId, users.id))
        .where(and(...whereConditions))

      const totalFilteredReports = totalCount[0].count

      if (totalFilteredReports === 0) {
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

      const reportIds = await db
        .select({ id: dailyReports.id })
        .from(dailyReports)
        .innerJoin(users, eq(dailyReports.userId, users.id))
        .where(and(...whereConditions))
        .orderBy(desc(dailyReports.createdAt))
        .limit(limitNumber)
        .offset(skipNumber)

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

    const user = c.get('user')

    const skipNumber = Number(skip) ?? 0
    const limitNumber = Number(limit) ?? 10

    const { start: defaultStartDate, end: defaultEndDate } = dateUtils.getOneMonthAgoRangeByJST()

    // 日付範囲の条件を構築
    const start = startDate ? dateUtils.convertJstDateToUtc(startDate, 'start') : defaultStartDate
    const end = endDate ? dateUtils.convertJstDateToUtc(endDate, 'end') : defaultEndDate

    try {
      const where = and(
        eq(dailyReports.userId, user.id),
        gte(dailyReports.reportDate, start),
        lte(dailyReports.reportDate, end),
      )

      const reports = await db.query.dailyReports.findMany({
        where,
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

      // レポートが見つからない場合は早期リターン
      if (reports.length === 0) {
        return c.json(
          {
            users: [],
            skip: skipNumber,
            limit: limitNumber,
            startDate,
            endDate,
            userId: user.id,
          },
          200,
        )
      }

      const reportsWithMissions = reports.map((report) => {
        const totalHours = report.dailyReportMissions.reduce(
          (sum, mission) => sum + (mission.hours ?? 0),
          0,
        )

        return {
          id: report.id,
          date: dateUtils.formatDateByJST(report.reportDate ?? new Date()),
          username: user.name,
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

      return c.json(
        {
          users: reportsWithMissions,
          skip: skipNumber,
          limit: limitNumber,
          startDate,
          endDate,
          userId: user.id,
        },
        200,
      )
    } catch (error) {
      console.error('Error fetching mine reports:', error)

      return c.json({ error: 'Failed to fetch mine reports' }, 500)
    }
  })
  .get('/mine/summary', sessionMiddleware, async (c) => {
    const { startDate, endDate, limit, skip } = c.req.query()

    const userId = c.get('user').id

    const limitNumber = Number(limit) ?? 10
    const skipNumber = Number(skip) ?? 0

    const { start: defaultStartDate, end: defaultEndDate } = dateUtils.getOneMonthAgoRangeByJST()

    const start = startDate ? dateUtils.convertJstDateToUtc(startDate, 'start') : defaultStartDate
    const end = endDate ? dateUtils.convertJstDateToUtc(endDate, 'end') : defaultEndDate

    try {
      const where = and(
        eq(dailyReports.userId, userId),
        gte(dailyReports.reportDate, start),
        lte(dailyReports.reportDate, end),
      )

      const totalTimeForEachProject = await db
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
        .where(where)
        .groupBy(projects.id, projects.name)
        .orderBy(desc(sql<number>`sum(${dailyReportMissions.hours})`))
        .limit(limitNumber)
        .offset(skipNumber)

      const formattedProjectSummary = totalTimeForEachProject.map((item) => ({
        ...item,
        averageHoursPerDay: item.workDays > 0 ? item.totalHours / item.workDays : 0,
      }))

      return c.json({ summary: formattedProjectSummary }, 200)
    } catch (error) {
      console.error('Error fetching project summary:', error)

      return c.json({ error: 'Failed to fetch project summary' }, 500)
    }
  })
  .get('/count', sessionMiddleware, async (c) => {
    const { kind, startDate, endDate } = c.req.query()

    const userId = c.get('user').id

    const { start: defaultStartDate, end: defaultEndDate } = dateUtils.getOneMonthAgoRangeByJST()

    const start = startDate ? dateUtils.convertJstDateToUtc(startDate, 'start') : defaultStartDate
    const end = endDate ? dateUtils.convertJstDateToUtc(endDate, 'end') : defaultEndDate

    try {
      const where =
        kind === 'everyone'
          ? and(gte(dailyReports.reportDate, start), lte(dailyReports.reportDate, end))
          : and(
              eq(dailyReports.userId, userId),
              gte(dailyReports.reportDate, start),
              lte(dailyReports.reportDate, end),
            )

      const dateCountQuery = db
        .select({ count: count(dailyReports.id) })
        .from(dailyReports)
        .where(where)

      const projectCountQuery = db
        .select({ count: countDistinct(projects.id) })
        .from(dailyReports)
        .innerJoin(dailyReportMissions, eq(dailyReports.id, dailyReportMissions.dailyReportId))
        .innerJoin(missions, eq(dailyReportMissions.missionId, missions.id))
        .innerJoin(projects, eq(missions.projectId, projects.id))
        .where(where)

      const grandTotalHourQuery = db
        .select({
          total: sql<number>`sum(${dailyReportMissions.hours})`.mapWith(Number),
        })
        .from(dailyReportMissions)
        .leftJoin(dailyReports, eq(dailyReportMissions.dailyReportId, dailyReports.id))
        .where(where)

      const [dateCountResult, projectCountResult, grandTotalHourResult] = await Promise.all([
        dateCountQuery,
        projectCountQuery,
        grandTotalHourQuery,
      ])

      return c.json(
        {
          dateTotal: dateCountResult[0].count,
          projectTotal: projectCountResult[0].count,
          grandTotalHour: grandTotalHourResult[0].total ?? 0,
        },
        200,
      )
    } catch (error) {
      console.error('Error fetching count:', error)

      return c.json({ error: 'Failed to fetch count' }, 500)
    }
  })
  .get('/:id', sessionMiddleware, async (c) => {
    const reportId = c.req.param('id')
    const userId = c.get('user').id

    try {
      const existingReport = await db.query.dailyReports.findFirst({
        where: and(eq(dailyReports.id, reportId), eq(dailyReports.userId, userId)),
        columns: { id: true },
      })

      if (!existingReport) {
        return c.json({ error: 'Report not found or unauthorized' }, 404)
      }

      const reportQuery = db.query.dailyReports.findFirst({
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

      const userTroublesQuery = db.query.troubles.findMany({
        where: and(eq(troubles.userId, userId), eq(troubles.resolved, false)),
        with: {
          categoryOfTrouble: true,
        },
      })

      const [report, userTroubles] = await Promise.all([reportQuery, userTroublesQuery])

      if (!report) {
        return c.json({ error: 'Report not found or unauthorized' }, 404)
      }

      const formattedReport = {
        id: report.id,
        reportDate: report.reportDate
          ? dateUtils.formatDateByJST(report.reportDate ?? new Date())
          : '',
        remote: report.remote,
        impression: report.impression ?? '',
        reportEntries: report.dailyReportMissions.map((dailyReportMissions) => ({
          id: dailyReportMissions.id,
          project: dailyReportMissions.mission.project.name,
          mission: dailyReportMissions.mission.name,
          projectId: dailyReportMissions.mission.project.id,
          missionId: dailyReportMissions.mission.id,
          content: dailyReportMissions.workContent,
          hours: dailyReportMissions.hours ?? 0,
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
