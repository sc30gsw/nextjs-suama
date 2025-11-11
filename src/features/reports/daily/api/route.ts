import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { getCountHandler } from '~/features/reports/daily/api/handlers/count-handler'
import { getDailyReportDetailHandler } from '~/features/reports/daily/api/handlers/detail-handler'
import { getDailyReportsListHandler } from '~/features/reports/daily/api/handlers/list-handler'
import { getDailyReportSummaryHandler } from '~/features/reports/daily/api/handlers/summary-handler'
import {
  DailyReportCountQuerySchema,
  DailyReportCountResponseSchema,
  DailyReportDetailResponseSchema,
  DailyReportsQuerySchema,
  DailyReportsResponseSchema,
  DailyReportSummaryQuerySchema,
  DailyReportSummaryResponseSchema,
  ErrorResponseSchema,
} from '~/features/reports/daily/types/schemas/daily-report-api-schema'
import type { AdditionalVariables } from '~/features/reports/types'
import { sessionMiddleware } from '~/lib/session-middleware'

export const getDailyReportsListRoute = createRoute({
  method: 'get',
  path: '/',
  request: {
    query: DailyReportsQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: DailyReportsResponseSchema,
        },
      },
      description: '日報一覧を正常に取得',
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
  tags: ['Daily Reports'],
  summary: '日報一覧取得',
  description:
    '日報を日付範囲で取得します。userIdを指定した場合は特定のユーザーの日報、userNamesを指定した場合はユーザー名でフィルタリング、何も指定しない場合は全員の日報を返します。',
})

export const getCountRoute = createRoute({
  method: 'get',
  path: '/count',
  request: {
    query: DailyReportCountQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: DailyReportCountResponseSchema,
        },
      },
      description: '集計データを正常に取得',
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
  tags: ['Daily Reports'],
  summary: '日報集計データ取得',
  description:
    '日報数、プロジェクト数、合計時間の集計データを取得します。userIdまたはuserNamesを指定しない場合は全員の集計、指定した場合は特定のユーザーの集計を返します。',
})

export const getDailyReportSummaryRoute = createRoute({
  method: 'get',
  path: '/summary',
  request: {
    query: DailyReportSummaryQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: DailyReportSummaryResponseSchema,
        },
      },
      description: '日報詳細を正常に取得',
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
  tags: ['Daily Reports'],
  summary: '日報プロジェクトサマリー取得',
  description:
    '日報のプロジェクトごとの作業統計サマリーを取得します。userIdを指定しない場合は全員のサマリー、指定した場合は特定のユーザーのサマリーを返します。',
})

export const getDailyReportDetailRoute = createRoute({
  method: 'get',
  path: '/{id}',
  request: {
    params: z.object({
      id: z.string().openapi({
        param: { name: 'id', in: 'path' },
        description: '日報ID',
        example: 'report_123',
      }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: DailyReportDetailResponseSchema,
        },
      },
      description: '日報詳細を正常に取得',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: '認証が必要です',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: '日報が見つからない、または権限なし',
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
  tags: ['Daily Reports'],
  summary: '日報詳細取得',
  description: '指定されたIDの、認証済みユーザーの日報の詳細情報を取得します。',
})

const app = new OpenAPIHono<AdditionalVariables>()
app.use('/*', sessionMiddleware)

export const dailyApi = app
  .openapi(getDailyReportsListRoute, getDailyReportsListHandler)
  .openapi(getCountRoute, getCountHandler)
  .openapi(getDailyReportSummaryRoute, getDailyReportSummaryHandler)
  .openapi(getDailyReportDetailRoute, getDailyReportDetailHandler)
