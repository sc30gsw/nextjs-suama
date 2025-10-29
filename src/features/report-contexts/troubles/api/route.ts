import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { getTroubleCategoriesHandler } from '~/features/report-contexts/troubles/api/handler'
import {
  ErrorResponseSchema,
  TroublesQuerySchema,
  TroublesResponseSchema,
} from '~/features/report-contexts/troubles/types/schemas/troubles-api-schema'
import { sessionMiddleware } from '~/lib/session-middleware'

export const getTroubleCategoriesRoute = createRoute({
  method: 'get',
  path: '/categories',
  request: {
    query: TroublesQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: TroublesResponseSchema,
        },
      },
      description: 'トラブルカテゴリー一覧を正常に取得',
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
  tags: ['Troubles'],
  summary: 'トラブルカテゴリー一覧取得',
  description:
    'トラブルカテゴリーの一覧を取得します。withData=trueの場合、未解決のトラブルデータも含まれます。',
})

const app = new OpenAPIHono()
app.use('/*', sessionMiddleware)

export const troubleApi = app.openapi(getTroubleCategoriesRoute, getTroubleCategoriesHandler)
