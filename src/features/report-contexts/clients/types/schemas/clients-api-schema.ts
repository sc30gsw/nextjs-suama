import { z } from '@hono/zod-openapi'

export const ClientsQuerySchema = z.object({
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
      example: 'ClientA,ClientB',
      description: 'カンマ区切りのクライアント名フィルター',
    }),
})

export const ClientSchema = z
  .object({
    id: z.string().openapi({
      example: 'client_123',
      description: 'クライアントID',
    }),
    name: z.string().openapi({
      example: 'ABC Corporation',
      description: 'クライアント名',
    }),
    likeKeywords: z.string().openapi({
      example: 'abc,corp,corporation',
      description: 'Like検索用キーワード',
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
  .openapi('Client')

export const ClientsResponseSchema = z.object({
  clients: z.array(ClientSchema).openapi({
    description: 'クライアントのリスト',
  }),
  total: z.number().openapi({
    example: 50,
    description: '総クライアント数',
  }),
  skip: z.number().openapi({
    example: 0,
    description: 'スキップした件数',
  }),
  limit: z.number().openapi({
    example: 10,
    description: '取得した最大件数',
  }),
})

export const ErrorResponseSchema = z.object({
  error: z.string().openapi({
    example: 'Something went wrong',
    description: 'エラーメッセージ',
  }),
})
