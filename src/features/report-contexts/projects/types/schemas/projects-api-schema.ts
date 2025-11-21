import { z } from '@hono/zod-openapi'

export const ProjectsQuerySchema = z.object({
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
      example: 'ProjectA,ProjectB',
      description: 'カンマ区切りのプロジェクト名フィルター',
    }),
  isArchived: z
    .enum(['true', 'false'])
    .optional()
    .openapi({
      param: {
        name: 'isArchived',
        in: 'query',
      },
      example: 'false',
      description: 'アーカイブ済みプロジェクトを含めるかどうか (true/false)',
    }),
})

export const MissionRefSchema = z.object({
  id: z.string().openapi({
    example: 'mission_123',
    description: 'ミッションID',
  }),
})

export const ClientRefSchema = z.object({
  id: z.string().openapi({
    example: 'client_123',
    description: 'クライアントID',
  }),
  name: z.string().openapi({
    example: 'ABC Corporation',
    description: 'クライアント名',
  }),
  likeKeywords: z.string().openapi({
    example: 'abc,corp',
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

export const ProjectSchema = z
  .object({
    id: z.string().openapi({
      example: 'project_123',
      description: 'プロジェクトID',
    }),
    name: z.string().openapi({
      example: 'Web Application Development',
      description: 'プロジェクト名',
    }),
    likeKeywords: z.string().openapi({
      example: 'web,app,development',
      description: 'Like検索用キーワード',
    }),
    isArchived: z.boolean().openapi({
      example: false,
      description: 'アーカイブ済みかどうか',
    }),
    clientId: z.string().openapi({
      example: 'client_123',
      description: 'クライアントID',
    }),
    createdAt: z.string().openapi({
      example: '2024-01-01T00:00:00.000Z',
      description: '作成日時',
    }),
    updatedAt: z.string().nullable().openapi({
      example: '2024-01-01T00:00:00.000Z',
      description: '更新日時',
    }),
    client: ClientRefSchema.openapi({
      description: '関連クライアント情報',
    }),
    missions: z.array(MissionRefSchema).openapi({
      description: '関連ミッションのIDリスト',
    }),
  })
  .openapi('Project')

export const ProjectsResponseSchema = z.object({
  projects: z.array(ProjectSchema).openapi({
    description: 'プロジェクトのリスト',
  }),
  total: z.number().openapi({
    example: 30,
    description: '総プロジェクト数',
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
