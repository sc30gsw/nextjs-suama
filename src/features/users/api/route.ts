import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { getUsersHandler } from '~/features/users/api/handler'
import {
  ErrorResponseSchema,
  UsersQuerySchema,
  UsersResponseSchema,
} from '~/features/users/types/schemas/users-api-schema'
import { sessionMiddleware } from '~/lib/session-middleware'

export const getUsersRoute = createRoute({
  method: 'get',
  path: '/',
  request: {
    query: UsersQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UsersResponseSchema,
        },
      },
      description: 'ユーザー一覧を正常に取得',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: '認証が必要です',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'サーバーエラー',
    },
  },
  security: [{ UserIdAuth: [] }],
  tags: ['Users'],
  summary: 'ユーザー一覧取得',
  description:
    'システムに登録されているユーザーの一覧を取得します。ページネーションと名前フィルタリングに対応しています。認証にはAuthorizationヘッダーにユーザーIDを設定してください。',
})

const app = new OpenAPIHono()
app.use('/*', sessionMiddleware)

export const userApi = app.openapi(getUsersRoute, getUsersHandler)
