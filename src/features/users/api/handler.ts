import type { RouteHandler } from '@hono/zod-openapi'
import { count, like, or } from 'drizzle-orm'
import { MAX_LIMIT } from '~/constants'
import { ERROR_STATUS } from '~/constants/error-message'
import { users } from '~/db/schema'
import type { getUsersRoute } from '~/features/users/api/route'
import { db } from '~/index'

export async function getUsersHandler(c: Parameters<RouteHandler<typeof getUsersRoute>>[0]) {
  const { skip, limit, userNames } = c.req.valid('query')

  const skipNumber = Number(skip) || 0
  const limitNumber = Number(limit) || MAX_LIMIT

  const userNamesArray = userNames ? userNames.split(',').map((name) => name.trim()) : []

  try {
    const whereClause =
      userNamesArray.length > 0
        ? or(...userNamesArray.flatMap((word) => [like(users.name, `%${word}%`)]))
        : undefined

    const userList = await db.query.users.findMany({
      where: whereClause,
      offset: skipNumber,
      limit: limitNumber,
      orderBy: (usersTable, { asc }) => [asc(usersTable.createdAt)],
    })

    const total = await db.select({ count: count() }).from(users).where(whereClause)

    const formattedUsers = userList.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt?.toISOString() ?? null,
    }))

    return c.json(
      {
        users: formattedUsers,
        total: total[0].count,
        skip: skipNumber,
        limit: limitNumber,
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
}
