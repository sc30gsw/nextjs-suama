import { z } from '@hono/zod-openapi'

export const AppealsQuerySchema = z.object({
  skip: z
    .string()
    .optional()
    .openapi({
      param: {
        name: 'skip',
        in: 'query',
      },
      example: '0',
      description: 'スキップする件数',
    }),
  limit: z
    .string()
    .optional()
    .openapi({
      param: {
        name: 'limit',
        in: 'query',
      },
      example: '10',
      description: '取得する最大件数',
    }),
  names: z
    .string()
    .optional()
    .openapi({
      param: {
        name: 'names',
        in: 'query',
      },
      example: 'CategoryA,CategoryB',
      description: 'カンマ区切りのカテゴリー名フィルター',
    }),
  withData: z
    .string()
    .optional()
    .openapi({
      param: {
        name: 'withData',
        in: 'query',
      },
      example: 'true',
      description: '既存のアピールデータも取得する場合はtrue',
    }),
  reportId: z
    .string()
    .optional()
    .openapi({
      param: {
        name: 'reportId',
        in: 'query',
      },
      example: 'report_123',
      description: '日報ID（withData=trueの場合に指定）',
    }),
  sortBy: z
    .enum(['name'])
    .optional()
    .openapi({
      param: {
        name: 'sortBy',
        in: 'query',
      },
      example: 'name',
      description: 'ソート対象の列 (name: カテゴリー名)',
    }),
  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .openapi({
      param: {
        name: 'sortOrder',
        in: 'query',
      },
      example: 'asc',
      description: 'ソート順 (asc: 昇順, desc: 降順)',
    }),
})

export const AppealCategorySchema = z.object({
  id: z.string().openapi({
    example: 'category_123',
    description: 'カテゴリーID',
  }),
  name: z.string().openapi({
    example: 'Process Improvement',
    description: 'カテゴリー名',
  }),
  createdAt: z.string().openapi({
    example: '2024-01-01T00:00:00.000Z',
    description: '作成日時',
  }),
  updatedAt: z.string().nullable().openapi({
    example: '2024-01-01T00:00:00.000Z',
    description: '更新日時',
  }),
})

export const ExistingAppealSchema = z.object({
  id: z.string().openapi({
    example: 'appeal_123',
    description: 'アピールID',
  }),
  categoryOfAppealId: z.string().openapi({
    example: 'category_123',
    description: 'カテゴリーID',
  }),
  appeal: z.string().openapi({
    example: 'Improved workflow efficiency',
    description: 'アピール内容',
  }),
})

export const AppealsResponseSchema = z.object({
  appealCategories: z.array(AppealCategorySchema).openapi({
    description: 'アピールカテゴリーのリスト',
  }),
  total: z.number().openapi({
    example: 15,
    description: '総カテゴリー数',
  }),
  skip: z.number().openapi({
    example: 0,
    description: 'スキップした件数',
  }),
  limit: z.number().openapi({
    example: 10,
    description: '取得した最大件数',
  }),
  existingAppeals: z.array(ExistingAppealSchema).openapi({
    description: '既存のアピールリスト（withData=trueかつreportId指定時のみ）',
  }),
})

export const ErrorResponseSchema = z.object({
  error: z.string().openapi({
    example: 'Something went wrong',
    description: 'エラーメッセージ',
  }),
})
