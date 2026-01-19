import { eq } from 'drizzle-orm'
import { Elysia } from 'elysia'
import { ERROR_STATUS } from '~/constants/error-message'
import { users } from '~/db/schema'
import { getDb } from '~/index'

class UnauthorizedError extends Error {
  status = 401

  constructor() {
    super(ERROR_STATUS.UNAUTHORIZED)
    this.name = 'UnauthorizedError'
  }
}

class UserNotFoundError extends Error {
  status = 404

  constructor() {
    super('User not found')
    this.name = 'UserNotFoundError'
  }
}

export const sessionMiddleware = new Elysia({ name: 'session' })
  .error({
    UnauthorizedError,
    UserNotFoundError,
  })
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'UnauthorizedError':
        set.status = error.status

        return {
          error: error.message,
          code: 'UNAUTHORIZED',
        }

      case 'UserNotFoundError':
        set.status = error.status

        return {
          error: error.message,
          code: 'USER_NOT_FOUND',
        }

      default:
        throw error
    }
  })
  .derive(async ({ headers }) => {
    const userId = headers.authorization

    if (!userId) {
      throw new UnauthorizedError()
    }

    const user = await getDb().query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (!user) {
      throw new UserNotFoundError()
    }

    return { user }
  })
  .as('scoped')
