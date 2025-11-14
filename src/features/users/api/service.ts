import type { RouteHandler } from '@hono/zod-openapi'
import { count, like, or } from 'drizzle-orm'
import { PAGINATION } from '~/constants/pagination'
import { users } from '~/db/schema'
import type { getUsersRoute } from '~/features/users/api/route'
import { db } from '~/index'

export class UserServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UserServiceError'
  }
}

export class UserService {
  async getUsers(
    params: ReturnType<Parameters<RouteHandler<typeof getUsersRoute>>[0]['req']['valid']>,
  ) {
    const { skip, limit, userNames } = params

    const skipNumber = Number(skip) || PAGINATION.VALUES.DEFAULTS.SKIP
    const limitNumber = Number(limit) || PAGINATION.VALUES.LIMITS.MAX_LIMIT
    const userNamesArray = userNames ? userNames.split(',').map((name) => name.trim()) : undefined

    try {
      const whereClause =
        userNamesArray && userNamesArray.length > 0
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

      return {
        users: formattedUsers,
        total: total[0].count,
        skip: skipNumber,
        limit: limitNumber,
      }
    } catch (error) {
      throw new UserServiceError(
        `Failed to get users: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
