import { and, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { weeklyReports } from '~/db/schema'
import { db } from '~/index'
import { upfetchForDummy } from '~/lib/fetcher'
import { sessionMiddleware } from '~/lib/session-middleware'

// TODO: 週報を取得するAPIを実装する
const app = new Hono()
  .get('/', sessionMiddleware, async (c) => {
    // TODO: startDate, endDateから先週・次週の月曜日〜日曜日を取得する
    const { startDate, endDate, offset } = c.req.query()

    // TODO: more loadingのために、offsetを指定して取得する
    // ! 将来、社員が増えた場合に仮想化しないと、処理が重くなる可能性がある
    // const List = await db.query.reports.findMany({
    //   where: ,
    //   limit: 30,
    //   offset: Number(offset),
    //   with: {
    //     appeals: true,
    //   },
    // })

    type User = {
      id: number
      firstName: string
      lastName: string
      age: number
      phone: string
      email: string
      username: string
      gender: string
      birthDate: string
      role: 'admin' | 'moderator'
    }

    type Response = {
      users: User[]
      total: number
      skip: number
      limit: number
    }

    // ! sessionのユーザーの情報を使用してデータを取得すること
    const user = c.get('user')

    // TODO: 実際の週報（今週・先週・次週）分を取得する
    const userList = await upfetchForDummy<Response>('/users', {
      params: {
        select:
          'firstName,lastName,age,phone,email,username,gender,birthDate,role',
        limit: 10,
        skip: Number(offset),
      },
    })

    // ダミーレポート生成関数
    function createDummyReports(count: number) {
      return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: `プロジェクト${i + 1}`,
        gender: '不明',
        age: 20 + i,
        occupation: `職務内容${i + 1}`,
      }))
    }

    const usersWithReports = userList.users.map((user) => ({
      ...user,
      reports: {
        lastWeekReports: createDummyReports(10),
        reports: createDummyReports(10),
        nextWeekReports: createDummyReports(10),
      },
    }))

    const response = {
      users: usersWithReports,
      total: userList.total,
      skip: userList.skip,
      limit: userList.limit,
    }

    // TODO: ユーザー紐づく未解決の困っていること取得
    // TODO: startDateとendDateの期間内に作成されたreportId（日報のID）に紐づく全ての工夫したことを取得

    return c.json(
      { userList: response, startDate, endDate, userId: user.id },
      200,
    )
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

    if (!weeklyReport) {
      return c.json({ message: 'Not found' }, 404)
    }

    return c.json({ weeklyReport }, 200)
  })

export default app
