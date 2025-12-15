import type { RouteHandler } from '@hono/zod-openapi'
import { and, type asc, count, eq, like, or } from 'drizzle-orm'
import { QUERY_DEFAULT_PARAMS, QUERY_MAX_LIMIT_VALUES } from '~/constants'
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
    const { skip, limit, userNames, retirementStatus, sortBy, sortOrder } = params

    const skipNumber = Number(skip) || QUERY_DEFAULT_PARAMS.SKIP
    const limitNumber = Number(limit) || QUERY_MAX_LIMIT_VALUES.GENERAL
    const userNamesArray = userNames ? userNames.split(',').map((name) => name.trim()) : undefined

    try {
      const nameConditions =
        userNamesArray && userNamesArray.length > 0
          ? or(
              ...userNamesArray.flatMap((word) => [
                like(users.name, `%${word}%`),
                like(users.email, `%${word}%`),
              ]),
            )
          : undefined

      const retireCondition =
        retirementStatus === 'active'
          ? eq(users.isRetired, false)
          : retirementStatus === 'retired'
            ? eq(users.isRetired, true)
            : undefined

      const whereClause =
        retireCondition && nameConditions
          ? and(retireCondition, nameConditions)
          : retireCondition
            ? retireCondition
            : nameConditions

      const userList = await db.query.users.findMany({
        where: whereClause,
        offset: skipNumber,
        limit: limitNumber,
        orderBy: (usersTable, { asc: ascFn, desc: descFn }) => {
          const orderByArray: ReturnType<typeof asc>[] = []

          if (sortBy && sortOrder) {
            if (sortBy === 'name') {
              orderByArray.push(
                sortOrder === 'asc' ? ascFn(usersTable.name) : descFn(usersTable.name),
              )
            } else if (sortBy === 'status') {
              orderByArray.push(
                sortOrder === 'asc' ? ascFn(usersTable.isRetired) : descFn(usersTable.isRetired),
              )
            }
            orderByArray.push(ascFn(usersTable.isRetired))
          } else {
            orderByArray.push(ascFn(usersTable.isRetired))
          }

          orderByArray.push(ascFn(usersTable.createdAt))

          return orderByArray
        },
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
