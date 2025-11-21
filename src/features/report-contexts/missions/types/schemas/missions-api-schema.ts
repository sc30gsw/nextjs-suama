import { z } from '@hono/zod-openapi'

export const MissionsQuerySchema = z.object({
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
      example: 'MissionA,MissionB',
      description: 'カンマ区切りのミッション名フィルター',
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
      description: 'アーカイブ済みプロジェクトのミッションを含めるかどうか (true/false)',
    }),
})

export const ProjectRefSchema = z.object({
  name: z.string().openapi({
    example: 'Web Application Development',
    description: 'プロジェクト名',
  }),
})

export const MissionSchema = z
  .object({
    id: z.string().openapi({
      example: 'mission_123',
      description: 'ミッションID',
    }),
    name: z.string().openapi({
      example: 'Frontend Development',
      description: 'ミッション名',
    }),
    likeKeywords: z.string().openapi({
      example: 'frontend,react,ui',
      description: 'Like検索用キーワード',
    }),
    projectId: z.string().openapi({
      example: 'project_123',
      description: 'プロジェクトID',
    }),
    createdAt: z.string().openapi({
      example: '2024-01-01T00:00:00.000Z',
      description: '作成日時',
    }),
    updatedAt: z.string().nullable().openapi({
      example: '2024-01-01T00:00:00.000Z',
      description: '更新日時',
    }),
    project: ProjectRefSchema.openapi({
      description: '関連プロジェクト情報',
    }),
  })
  .openapi('Mission')

export const MissionsResponseSchema = z.object({
  missions: z.array(MissionSchema).openapi({
    description: 'ミッションのリスト',
  }),
  total: z.number().openapi({
    example: 40,
    description: '総ミッション数',
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
