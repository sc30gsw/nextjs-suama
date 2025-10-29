import { z } from '@hono/zod-openapi'

export const TroublesQuerySchema = z.object({
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
      description: '未解決のトラブルデータも取得する場合はtrue',
    }),
})

export const TroubleCategorySchema = z.object({
  id: z.string().openapi({
    example: 'category_123',
    description: 'カテゴリーID',
  }),
  name: z.string().openapi({
    example: 'Technical Issues',
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

export const UnresolvedTroubleSchema = z.object({
  id: z.string().openapi({
    example: 'trouble_123',
    description: 'トラブルID',
  }),
  categoryOfTroubleId: z.string().openapi({
    example: 'category_123',
    description: 'カテゴリーID',
  }),
  trouble: z.string().openapi({
    example: 'Server connection issue',
    description: 'トラブル内容',
  }),
  resolved: z.boolean().openapi({
    example: false,
    description: '解決済みフラグ',
  }),
})

// レスポンススキーマ
export const TroublesResponseSchema = z.object({
  troubleCategories: z.array(TroubleCategorySchema).openapi({
    description: 'トラブルカテゴリーのリスト',
  }),
  total: z.number().openapi({
    example: 20,
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
  unResolvedTroubles: z.array(UnresolvedTroubleSchema).openapi({
    description: '未解決のトラブルリスト（withData=trueの場合のみ）',
  }),
})

export const ErrorResponseSchema = z.object({
  error: z.string().openapi({
    example: 'Something went wrong',
    description: 'エラーメッセージ',
  }),
})
