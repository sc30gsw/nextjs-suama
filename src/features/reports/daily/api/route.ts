import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import {
  CountQuerySchema,
  CountResponseSchema,
  ErrorResponseSchema,
  MineQuerySchema,
  MineResponseSchema,
  ReportDetailResponseSchema,
  SummaryQuerySchema,
  SummaryResponseSchema,
  TodayQuerySchema,
  TodayResponseSchema,
} from '~/features/reports/daily/types/schemas/daily-api-schema'
import { sessionMiddleware } from '~/lib/session-middleware'
import {
  getCountHandler,
  getMineReportsHandler,
  getMineSummaryHandler,
  getReportDetailHandler,
  getTodayReportsHandler,
} from './handler'

export const getTodayReportsRoute = createRoute({
  method: 'get',
  path: '/today',
  request: {
    query: TodayQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: TodayResponseSchema,
        },
      },
      description: '今日の日報一覧を正常に取得',
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
  tags: ['Daily Reports'],
  summary: '今日の日報一覧取得',
  description: '今日の日報を取得します。ユーザー名でフィルタリング可能です。',
})

export const getMineReportsRoute = createRoute({
  method: 'get',
  path: '/mine',
  request: {
    query: MineQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: MineResponseSchema,
        },
      },
      description: '自分の日報一覧を正常に取得',
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
  tags: ['Daily Reports'],
  summary: '自分の日報一覧取得',
  description: '自分の日報を日付範囲で取得します。',
})

export const getMineSummaryRoute = createRoute({
  method: 'get',
  path: '/mine/summary',
  request: {
    query: SummaryQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SummaryResponseSchema,
        },
      },
      description: 'プロジェクトサマリーを正常に取得',
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
  tags: ['Daily Reports'],
  summary: 'プロジェクトサマリー取得',
  description: '自分のプロジェクトごとの作業統計サマリーを取得します。',
})

export const getCountRoute = createRoute({
  method: 'get',
  path: '/count',
  request: {
    query: CountQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: CountResponseSchema,
        },
      },
      description: '集計データを正常に取得',
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
  tags: ['Daily Reports'],
  summary: '日報集計データ取得',
  description: '日報数、プロジェクト数、合計時間の集計データを取得します。',
})

export const getReportDetailRoute = createRoute({
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
          schema: ReportDetailResponseSchema,
        },
      },
      description: '日報詳細を正常に取得',
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
  tags: ['Daily Reports'],
  summary: '日報詳細取得',
  description: '指定されたIDの日報の詳細情報を取得します。',
})

const app = new OpenAPIHono()
app.use('/*', sessionMiddleware)
app.openapi(getTodayReportsRoute, getTodayReportsHandler)
app.openapi(getMineReportsRoute, getMineReportsHandler)
app.openapi(getMineSummaryRoute, getMineSummaryHandler)
app.openapi(getCountRoute, getCountHandler)
app.openapi(getReportDetailRoute, getReportDetailHandler)

export const dailyApi = app
