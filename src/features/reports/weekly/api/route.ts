import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import type { AdditionalVariables } from '~/features/reports/types'
import {
  getCurrentUserWeeklyReportHandler,
  getLastWeekReportHandler,
  getWeeklyReportByIdHandler,
  getWeeklyReportsHandler,
} from '~/features/reports/weekly/api/handler'
import {
  CurrentUserWeeklyReportResponseSchema,
  ErrorResponseSchema,
  LastWeekReportResponseSchema,
  WeeklyReportByIdResponseSchema,
  WeeklyReportsQuerySchema,
  WeeklyReportsResponseSchema,
} from '~/features/reports/weekly/types/schemas/weekly-api-schema'
import { sessionMiddleware } from '~/lib/session-middleware'

export const getWeeklyReportsRoute = createRoute({
  method: 'get',
  path: '/',
  request: {
    query: WeeklyReportsQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: WeeklyReportsResponseSchema,
        },
      },
      description: '週報一覧を正常に取得',
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
  tags: ['Weekly Reports'],
  summary: '週報一覧取得',
  description:
    '指定された年・週の全ユーザーの週報を取得します。前週の予定、今週の日報、次週の予定、未解決のトラブルを含みます。',
})

export const getWeeklyReportByIdRoute = createRoute({
  method: 'get',
  path: '/{weeklyReportId}',
  request: {
    params: z.object({
      weeklyReportId: z.string().openapi({
        param: { name: 'weeklyReportId', in: 'path' },
        description: '週報ID',
        example: 'weekly_123',
      }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: WeeklyReportByIdResponseSchema,
        },
      },
      description: '週報詳細を正常に取得',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: '週報が見つからない',
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
  tags: ['Weekly Reports'],
  summary: '週報詳細取得',
  description: '指定されたIDの週報の詳細情報を取得します。',
})

export const getCurrentUserWeeklyReportRoute = createRoute({
  method: 'get',
  path: '/current-user/{year}/{week}',
  request: {
    params: z.object({
      year: z.string().openapi({
        param: { name: 'year', in: 'path' },
        description: '年',
        example: '2024',
      }),
      week: z.string().openapi({
        param: { name: 'week', in: 'path' },
        description: '週番号',
        example: '21',
      }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: CurrentUserWeeklyReportResponseSchema,
        },
      },
      description: '現在のユーザーの週報を正常に取得',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: '週報が見つからない',
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
  tags: ['Weekly Reports'],
  summary: '現在のユーザーの週報取得',
  description: 'ログイン中のユーザーの指定された年・週の週報を取得します。',
})

export const getLastWeekReportRoute = createRoute({
  method: 'get',
  path: '/last-week/{year}/{week}',
  request: {
    params: z.object({
      year: z.string().openapi({
        param: { name: 'year', in: 'path' },
        description: '年',
        example: '2024',
      }),
      week: z.string().openapi({
        param: { name: 'week', in: 'path' },
        description: '週番号',
        example: '21',
      }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: LastWeekReportResponseSchema,
        },
      },
      description: '前週の週報を正常に取得',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: '週報が見つからない',
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
  tags: ['Weekly Reports'],
  summary: '前週の週報取得',
  description:
    'ログイン中のユーザーの前週（指定週-1）の週報を取得します。ミッション情報を含みます。',
})

const app = new OpenAPIHono<AdditionalVariables>()
app.use('/*', sessionMiddleware)

export const weeklyApi = app
  .openapi(getWeeklyReportsRoute, getWeeklyReportsHandler)
  .openapi(getWeeklyReportByIdRoute, getWeeklyReportByIdHandler)
  .openapi(getCurrentUserWeeklyReportRoute, getCurrentUserWeeklyReportHandler)
  .openapi(getLastWeekReportRoute, getLastWeekReportHandler)
