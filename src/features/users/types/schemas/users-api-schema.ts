import { z } from '@hono/zod-openapi'

export const UsersQuerySchema = z.object({
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
  userNames: z
    .string()
    .optional()
    .openapi({
      param: {
        name: 'userNames',
        in: 'query',
      },
      example: 'John,Jane',
      description: 'カンマ区切りのユーザー名フィルター',
    }),
})

export const UserSchema = z
  .object({
    id: z.string().openapi({
      example: 'user_123',
      description: 'ユーザーID',
    }),
    name: z.string().openapi({
      example: 'John Doe',
      description: 'ユーザー名',
    }),
    email: z.string().openapi({
      example: 'john@example.com',
      description: 'メールアドレス',
    }),
    emailVerified: z.boolean().openapi({
      example: true,
      description: 'メールアドレスが確認済みかどうか',
    }),
    image: z.string().nullable().openapi({
      example: 'https://example.com/avatar.jpg',
      description: 'プロフィール画像URL',
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
  .openapi('User')

export const UsersResponseSchema = z.object({
  users: z.array(UserSchema).openapi({
    description: 'ユーザーのリスト',
  }),
  total: z.number().openapi({
    example: 100,
    description: '総ユーザー数',
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
