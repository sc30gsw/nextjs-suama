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

const MissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  likeKeywords: z.string(),
  projectId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
  project: z.object({
    id: z.string(),
    name: z.string(),
    likeKeywords: z.string(),
    isArchived: z.boolean(),
    clientId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string().nullable(),
  }),
})

const CategoryOfTroubleSchema = z.object({
  name: z.string(),
})

const CategoryOfAppealSchema = z.object({
  name: z.string(),
})

const DailyReportMissionSchema = z.object({
  id: z.string(),
  workContent: z.string(),
  hours: z.number().nullable(),
  missionId: z.string(),
  dailyReportId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
  mission: MissionSchema,
})

const SimpleWeeklyReportMissionSchema = z.object({
  id: z.string(),
  hours: z.number(),
  workContent: z.string(),
  weeklyReportId: z.string(),
  missionId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
})

const WeeklyReportMissionSchema = z.object({
  id: z.string(),
  hours: z.number(),
  workContent: z.string(),
  weeklyReportId: z.string(),
  missionId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
  mission: MissionSchema,
})

const TroubleSchema = z.object({
  id: z.string(),
  trouble: z.string(),
  resolved: z.boolean(),
  userId: z.string(),
  categoryOfTroubleId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
  categoryOfTrouble: CategoryOfTroubleSchema,
})

const AppealSchema = z.object({
  id: z.string(),
  appeal: z.string(),
  userId: z.string(),
  categoryOfAppealId: z.string(),
  dailyReportId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
  categoryOfAppeal: CategoryOfAppealSchema,
})

const DailyReportSchema = z.object({
  id: z.string(),
  reportDate: z.string().nullable(),
  impression: z.string().nullable(),
  userId: z.string(),
  release: z.boolean(),
  remote: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
  dailyReportMissions: z.array(DailyReportMissionSchema),
  appeals: z.array(AppealSchema),
})

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
})

const SimpleWeeklyReportSchema = z.object({
  id: z.string(),
  userId: z.string(),
  year: z.number(),
  week: z.number(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
  weeklyReportMissions: z.array(SimpleWeeklyReportMissionSchema),
})

const WeeklyReportSchema = z.object({
  id: z.string(),
  userId: z.string(),
  year: z.number(),
  week: z.number(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
  weeklyReportMissions: z.array(WeeklyReportMissionSchema),
})

const WeeklyReportDataSchema = z.object({
  user: UserSchema,
  lastWeekReports: z.array(WeeklyReportSchema),
  dailyReports: z.array(DailyReportSchema),
  nextWeekReports: z.array(WeeklyReportSchema),
  troubles: z.array(TroubleSchema),
})

export const WeeklyReportsResponseSchema = z.object({
  reports: z.array(WeeklyReportDataSchema).openapi({ description: 'ユーザーごとの週報データ' }),
  startDate: z.string().openapi({ description: '週の開始日' }),
  endDate: z.string().openapi({ description: '週の終了日' }),
})

export const WeeklyReportByIdResponseSchema = z.object({
  weeklyReport: SimpleWeeklyReportSchema.nullable().openapi({ description: '週報詳細データ' }),
})

export const CurrentUserWeeklyReportResponseSchema = z.object({
  weeklyReport: SimpleWeeklyReportSchema.nullable().openapi({
    description: '現在のユーザーの週報データ',
  }),
})

export const LastWeekReportResponseSchema = z.object({
  weeklyReport: WeeklyReportSchema.nullable().openapi({ description: '前週の週報データ' }),
})

export const ErrorResponseSchema = z.object({
  error: z.string().openapi({
    example: 'Something went wrong',
    description: 'エラーメッセージ',
  }),
})
