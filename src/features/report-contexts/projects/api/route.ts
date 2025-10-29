import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { getProjectsHandler } from '~/features/report-contexts/projects/api/handler'
import {
  ErrorResponseSchema,
  ProjectsQuerySchema,
  ProjectsResponseSchema,
} from '~/features/report-contexts/projects/types/schemas/projects-api-schema'
import { sessionMiddleware } from '~/lib/session-middleware'

export const getProjectsRoute = createRoute({
  method: 'get',
  path: '/',
  request: {
    query: ProjectsQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ProjectsResponseSchema,
        },
      },
      description: 'プロジェクト一覧を正常に取得',
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
  tags: ['Projects'],
  summary: 'プロジェクト一覧取得',
  description:
    'システムに登録されているプロジェクトの一覧を取得します。関連クライアントとミッションのIDも含まれます。',
})

const app = new OpenAPIHono()
app.use('/*', sessionMiddleware)

export const projectApi = app.openapi(getProjectsRoute, getProjectsHandler)
