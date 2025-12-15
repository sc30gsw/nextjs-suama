import type { RouteHandler } from '@hono/zod-openapi'
import { ERROR_STATUS } from '~/constants/error-message'
import type { getUsersRoute } from '~/features/users/api/route'
import { UserService, UserServiceError } from '~/features/users/api/service'

const userService = new UserService()

export async function getUsersHandler(c: Parameters<RouteHandler<typeof getUsersRoute>>[0]) {
  const { skip, limit, userNames, retirementStatus } = c.req.valid('query')

  try {
    const result = await userService.getUsers({
      skip,
      limit,
      userNames,
      retirementStatus,
    })

    return c.json(result, 200)
  } catch (error) {
    if (error instanceof UserServiceError) {
      console.error('UserService error:', error.message)
    }

    return c.json(
      {
        error: ERROR_STATUS.SOMETHING_WENT_WRONG,
      },
      500,
    )
  }
}
