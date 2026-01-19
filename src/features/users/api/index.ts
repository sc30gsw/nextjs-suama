import { Elysia, t } from 'elysia'
import { sessionMiddleware } from '~/lib/session-middleware'
import { UserNotFoundError, UserServiceError } from '~/features/users/api/errors'
import { UserService } from '~/features/users/api/service'
import { UserModel } from '~/features/users/api/model'

export const userPlugin = new Elysia({ prefix: '/users', name: 'user' })
  .use(sessionMiddleware)
  .error({
    UserServiceError,
    UserNotFoundError,
  })
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'UserServiceError':
        set.status = error.status || 500

        return {
          error: error.message,
          code: 'USER_SERVICE_ERROR',
        }
      case 'UserNotFoundError':
        set.status = error.status || 404

        return {
          error: error.message,
          code: 'USER_NOT_FOUND',
        }

      default:
        throw error
    }
  })
  .get(
    '/',
    async ({ query }) => {
      const result = await UserService.getUsers({
        skip: query.skip,
        limit: query.limit,
        userNames: query.userNames,
        retirementStatus: query.retirementStatus,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      })

      return result
    },
    {
      query: t.Optional(UserModel.getUsersQuery),
      response: {
        200: UserModel.getUsersResponse,
        401: UserModel.errorResponse,
        500: UserModel.errorResponse,
      },
      detail: {
        tags: ['Users'],
        summary: 'ユーザー一覧取得',
        description:
          'システムに登録されているユーザーの一覧を取得します。ページネーションと名前フィルタリングに対応しています。認証にはAuthorizationヘッダーにユーザーIDを設定してください。',
      },
    },
  )
