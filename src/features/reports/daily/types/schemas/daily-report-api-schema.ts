import { z } from '@hono/zod-openapi'

export const ErrorResponseSchema = z.object({
  error: z.string().openapi({
    example: 'Something went wrong',
    description: 'エラーメッセージ',
  }),
})

export const WorkContentSchema = z.object({
  id: z.string().openapi({ description: '作業内容ID' }),
  project: z.string().openapi({ description: 'プロジェクト名' }),
  mission: z.string().openapi({ description: 'ミッション名' }),
  workTime: z.number().openapi({ description: '作業時間' }),
  workContent: z.string().openapi({ description: '作業内容' }),
})

export const TodayReportSchema = z.object({
  id: z.string().openapi({ description: '日報ID' }),
  date: z.string().openapi({ description: '報告日' }),
  username: z.string().openapi({ description: 'ユーザー名' }),
  totalHour: z.number().openapi({ description: '合計時間' }),
  impression: z.string().openapi({ description: '所感' }),
  isRemote: z.boolean().openapi({ description: 'リモートフラグ' }),
  isTurnedIn: z.boolean().openapi({ description: '提出済みフラグ' }),
  userId: z.string().openapi({ description: 'ユーザーID' }),
  workContents: z.array(WorkContentSchema).openapi({ description: '作業内容リスト' }),
})

export const DailyReportsQuerySchema = z.object({
  userId: z
    .string()
    .optional()
    .openapi({
      param: { name: 'userId', in: 'query' },
      example: 'user_123',
      description: 'ユーザーID（指定しない場合は全員の日報）',
    }),
  userNames: z
    .string()
    .optional()
    .openapi({
      param: { name: 'userNames', in: 'query' },
      example: 'John,Jane',
      description: 'カンマ区切りのユーザー名フィルター',
    }),
  skip: z
    .string()
    .optional()
    .openapi({
      param: { name: 'skip', in: 'query' },
      example: '0',
      description: 'スキップする件数',
    }),
  limit: z
    .string()
    .optional()
    .openapi({
      param: { name: 'limit', in: 'query' },
      example: '10',
      description: '取得する最大件数',
    }),
  startDate: z
    .string()
    .optional()
    .openapi({
      param: { name: 'startDate', in: 'query' },
      example: '2024-01-01',
      description: '開始日（YYYY-MM-DD形式）',
    }),
  endDate: z
    .string()
    .optional()
    .openapi({
      param: { name: 'endDate', in: 'query' },
      example: '2024-01-31',
      description: '終了日（YYYY-MM-DD形式）',
    }),
})

export const DailyReportsResponseSchema = z.object({
  dailyReports: z.array(TodayReportSchema).openapi({ description: '日報レポートリスト' }),
  total: z.number().openapi({ description: '総レポート数' }),
  skip: z.number().openapi({ description: 'スキップした件数' }),
  limit: z.number().openapi({ description: '取得した最大件数' }),
  startDate: z.string().optional().openapi({ description: '開始日' }),
  endDate: z.string().optional().openapi({ description: '終了日' }),
  userId: z.string().optional().openapi({ description: 'ユーザーID' }),
})

export const ReportEntrySchema = z.object({
  id: z.string().openapi({ description: 'エントリーID' }),
  project: z.string().openapi({ description: 'プロジェクト名' }),
  mission: z.string().openapi({ description: 'ミッション名' }),
  projectId: z.string().openapi({ description: 'プロジェクトID' }),
  missionId: z.string().openapi({ description: 'ミッションID' }),
  content: z.string().openapi({ description: '作業内容' }),
  hours: z.number().openapi({ description: '作業時間' }),
})

export const AppealEntrySchema = z.object({
  id: z.string().openapi({ description: 'アピールID' }),
  categoryId: z.string().openapi({ description: 'カテゴリーID' }),
  content: z.string().openapi({ description: 'アピール内容' }),
})

export const TroubleEntrySchema = z.object({
  id: z.string().openapi({ description: 'トラブルID' }),
  categoryId: z.string().openapi({ description: 'カテゴリーID' }),
  content: z.string().openapi({ description: 'トラブル内容' }),
})

export const DailyReportDetailResponseSchema = z.object({
  id: z.string().openapi({ description: '日報ID' }),
  reportDate: z.string().openapi({ description: '報告日' }),
  remote: z.boolean().openapi({ description: 'リモートフラグ' }),
  impression: z.string().openapi({ description: '所感' }),
  reportEntries: z.array(ReportEntrySchema).openapi({ description: '作業エントリーリスト' }),
  appealEntries: z.array(AppealEntrySchema).openapi({ description: 'アピールエントリーリスト' }),
  troubleEntries: z.array(TroubleEntrySchema).openapi({ description: 'トラブルエントリーリスト' }),
})

export const DailyReportCountQuerySchema = z.object({
  userId: z
    .string()
    .optional()
    .openapi({
      param: { name: 'userId', in: 'query' },
      example: 'user_123',
      description: 'ユーザーID（指定しない場合は全員の集計）',
    }),
  userNames: z
    .string()
    .optional()
    .openapi({
      param: { name: 'userNames', in: 'query' },
      example: 'John,Jane',
      description: 'カンマ区切りのユーザー名フィルター',
    }),
  startDate: z
    .string()
    .optional()
    .openapi({
      param: { name: 'startDate', in: 'query' },
      example: '2024-01-01',
      description: '開始日（YYYY-MM-DD形式）',
    }),
  endDate: z
    .string()
    .optional()
    .openapi({
      param: { name: 'endDate', in: 'query' },
      example: '2024-01-31',
      description: '終了日（YYYY-MM-DD形式）',
    }),
})

export const DailyReportCountResponseSchema = z.object({
  dailyReportsCount: z.number().openapi({ description: '日報数' }),
  projectsCount: z.number().openapi({ description: 'プロジェクト数' }),
  totalHours: z.number().openapi({ description: '合計時間' }),
})

export const ProjectSummarySchema = z.object({
  projectId: z.string().openapi({ description: 'プロジェクトID' }),
  projectName: z.string().openapi({ description: 'プロジェクト名' }),
  totalHours: z.number().openapi({ description: '合計時間' }),
  workDays: z.number().openapi({ description: '作業日数' }),
  firstWorkDate: z.string().nullable().openapi({ description: '初回作業日' }),
  lastWorkDate: z.string().nullable().openapi({ description: '最終作業日' }),
  averageHoursPerDay: z.number().openapi({ description: '1日あたりの平均時間' }),
})

export const DailyReportSummaryQuerySchema = z.object({
  userId: z
    .string()
    .optional()
    .openapi({
      param: { name: 'userId', in: 'query' },
      example: 'user_123',
      description: 'ユーザーID（指定しない場合は全員のサマリー）',
    }),
  userNames: z
    .string()
    .optional()
    .openapi({
      param: { name: 'userNames', in: 'query' },
      example: 'John,Jane',
      description: 'カンマ区切りのユーザー名フィルター',
    }),
  skip: z
    .string()
    .optional()
    .openapi({
      param: { name: 'skip', in: 'query' },
      example: '0',
      description: 'スキップする件数',
    }),
  limit: z
    .string()
    .optional()
    .openapi({
      param: { name: 'limit', in: 'query' },
      example: '10',
      description: '取得する最大件数',
    }),
  startDate: z
    .string()
    .optional()
    .openapi({
      param: { name: 'startDate', in: 'query' },
      example: '2024-01-01',
      description: '開始日（YYYY-MM-DD形式）',
    }),
  endDate: z
    .string()
    .optional()
    .openapi({
      param: { name: 'endDate', in: 'query' },
      example: '2024-01-31',
      description: '終了日（YYYY-MM-DD形式）',
    }),
})

export const DailyReportSummaryResponseSchema = z.object({
  summaries: z.array(ProjectSummarySchema).openapi({ description: 'プロジェクトサマリーリスト' }),
})

export const DailyReportDatesQuerySchema = z.object({
  year: z.string().openapi({
    param: { name: 'year', in: 'query' },
    example: '2024',
    description: '年（YYYY形式）',
  }),
  month: z.string().openapi({
    param: { name: 'month', in: 'query' },
    example: '1',
    description: '月（1-12）',
  }),
  excludeReportId: z
    .string()
    .optional()
    .openapi({
      param: { name: 'excludeReportId', in: 'query' },
      example: 'report_123',
      description: '除外する日報ID（編集時に使用）',
    }),
})

export const DailyReportDatesResponseSchema = z.object({
  dates: z.array(z.string()).openapi({
    description: '登録済み日報の日付リスト（YYYY-MM-DD形式、JST）',
    example: ['2024-01-01', '2024-01-15', '2024-01-20'],
  }),
})
