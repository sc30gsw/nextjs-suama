import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { getClientsHandler } from '~/features/report-contexts/clients/api/handler'
import {
  ClientsQuerySchema,
  ClientsResponseSchema,
  ErrorResponseSchema,
} from '~/features/report-contexts/clients/types/schemas/clients-api-schema'
import { sessionMiddleware } from '~/lib/session-middleware'

export const getClientsRoute = createRoute({
  method: 'get',
  path: '/',
  request: {
    query: ClientsQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ClientsResponseSchema,
        },
      },
      description: 'クライアント一覧を正常に取得',
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
  tags: ['Clients'],
  summary: 'クライアント一覧取得',
  description:
    'システムに登録されているクライアントの一覧を取得します。ページネーションと名前フィルタリングに対応しています。',
})

const app = new OpenAPIHono()
app.use('/*', sessionMiddleware)

export const clientApi = app.openapi(getClientsRoute, getClientsHandler)
