import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { getMissionsHandler } from '~/features/report-contexts/missions/api/handler'
import {
  ErrorResponseSchema,
  MissionsQuerySchema,
  MissionsResponseSchema,
} from '~/features/report-contexts/missions/types/schemas/missions-api-schema'
import { sessionMiddleware } from '~/lib/session-middleware'

export const getMissionsRoute = createRoute({
  method: 'get',
  path: '/',
  request: {
    query: MissionsQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: MissionsResponseSchema,
        },
      },
      description: 'ミッション一覧を正常に取得',
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
  tags: ['Missions'],
  summary: 'ミッション一覧取得',
  description:
    'システムに登録されているミッションの一覧を取得します。関連プロジェクト名も含まれます。',
})

const app = new OpenAPIHono()
app.use('/*', sessionMiddleware)

export const missionApi = app.openapi(getMissionsRoute, getMissionsHandler)
