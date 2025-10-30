import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { getAppealCategoriesHandler } from '~/features/report-contexts/appeals/api/handler'
import {
  AppealsQuerySchema,
  AppealsResponseSchema,
  ErrorResponseSchema,
} from '~/features/report-contexts/appeals/types/schemas/appeals-api-schema'
import { sessionMiddleware } from '~/lib/session-middleware'

export const getAppealCategoriesRoute = createRoute({
  method: 'get',
  path: '/categories',
  request: {
    query: AppealsQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AppealsResponseSchema,
        },
      },
      description: 'アピールカテゴリー一覧を正常に取得',
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
  tags: ['Appeals'],
  summary: 'アピールカテゴリー一覧取得',
  description:
    'アピールカテゴリーの一覧を取得します。withData=trueかつreportId指定時は、既存のアピールデータも含まれます。',
})

const app = new OpenAPIHono()
app.use('/*', sessionMiddleware)

export const appealApi = app.openapi(getAppealCategoriesRoute, getAppealCategoriesHandler)
