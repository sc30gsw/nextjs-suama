import { count, eq, type InferSelectModel, like, or } from 'drizzle-orm'
import { Hono } from 'hono'
import { MAX_LIMIT } from '~/constants'
import { ERROR_STATUS } from '~/constants/error-message'
import { appeals, categoryOfAppeals } from '~/db/schema'
import { db } from '~/index'
import { sessionMiddleware } from '~/lib/session-middleware'

type ExistingAppeals = {
  id: InferSelectModel<typeof appeals>['id']
  categoryId: InferSelectModel<typeof appeals>['categoryOfAppealId']
  content: InferSelectModel<typeof appeals>['appeal']
}

const app = new Hono().get('/categories', sessionMiddleware, async (c) => {
  // アピールカテゴリーと、withData=trueかつreportIdがある場合には既存のアピールも取得するAPI
  const { skip, limit, names, withData, reportId } = c.req.query()

  const skipNumber = Number(skip) || 0
  const limitNumber = Number(limit) || MAX_LIMIT

  const namesArray = names ? names.split(',').map((name) => name.trim()) : []

  try {
    const whereClause =
      namesArray.length > 0
        ? or(...namesArray.flatMap((word) => [like(categoryOfAppeals.name, `%${word}%`)]))
        : undefined

    const categories = await db.query.categoryOfAppeals.findMany({
      where: whereClause,
      offset: skipNumber,
      limit: limitNumber,
      orderBy: (categoriesOfAppeals, { asc }) => [asc(categoriesOfAppeals.createdAt)],
    })

    const total = await db.select({ count: count() }).from(categoryOfAppeals).where(whereClause)

    let existingAppeals: ExistingAppeals[]

    if (withData === 'true' && reportId) {
      const appealsData = await db.query.appeals.findMany({
        columns: {
          id: true,
          categoryOfAppealId: true,
          appeal: true,
        },
        where: eq(appeals.dailyReportId, reportId),
        orderBy: (appeals, { desc }) => [desc(appeals.createdAt)],
      })
      existingAppeals = appealsData.map((appeal) => ({
        id: appeal.id,
        categoryId: appeal.categoryOfAppealId,
        content: appeal.appeal,
      }))
    } else {
      existingAppeals = []
    }

    return c.json(
      {
        appealCategories: categories,
        total: total[0].count,
        skip: skipNumber,
        limit: limitNumber,
        existingAppeals,
      },
      200,
    )
  } catch (_) {
    return c.json(
      {
        error: ERROR_STATUS.SOMETHING_WENT_WRONG,
      },
      500,
    )
  }
})

export default app
