import { z } from '@hono/zod-openapi'

export const WeeklyReportsQuerySchema = z.object({
  year: z.string().openapi({
    param: { name: 'year', in: 'query' },
    example: '2024',
    description: '年',
  }),
  week: z.string().openapi({
    param: { name: 'week', in: 'query' },
    example: '21',
    description: '週番号',
  }),
  offset: z
    .string()
    .optional()
    .openapi({
      param: { name: 'offset', in: 'query' },
      example: '0',
      description: 'オフセット',
    }),
})

export const WeeklyReportsResponseSchema = z.object({
  reports: z.any().openapi({ description: 'ユーザーごとの週報データ（複雑なネスト構造）' }),
  startDate: z.string().openapi({ description: '週の開始日' }),
  endDate: z.string().openapi({ description: '週の終了日' }),
})

export const WeeklyReportByIdResponseSchema = z.object({
  weeklyReport: z.any().openapi({ description: '週報詳細データ' }),
})

export const CurrentUserWeeklyReportResponseSchema = z.object({
  weeklyReport: z.any().openapi({ description: '現在のユーザーの週報データ' }),
})

export const LastWeekReportResponseSchema = z.object({
  weeklyReport: z.any().openapi({ description: '前週の週報データ' }),
})

export const ErrorResponseSchema = z.object({
  error: z.string().openapi({
    example: 'Something went wrong',
    description: 'エラーメッセージ',
  }),
})
