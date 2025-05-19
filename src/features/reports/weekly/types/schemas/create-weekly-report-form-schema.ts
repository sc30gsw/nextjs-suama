import { z } from 'zod'

export const createWeeklyReportSchema = z.object({
  id: z.string().uuid(),
  project: z.string({ required_error: 'プロジェクトを選択してください' }),
  mission: z.string({ required_error: 'ミッションを選択してください' }),
  content: z.string({ required_error: '内容を入力してください' }),
  hours: z
    .string()
    .transform((value) => Number(value))
    .refine((data) => data > 0, {
      message: '0より大きい数値で入力してください',
    }),
})

export const createWeeklyReportFormSchema = z.object({
  year: z.number(),
  week: z.number(),
  weeklyReports: z
    .array(createWeeklyReportSchema)
    .min(1, '週報の内容は1件以上必要です'),
})

export type CreateWeeklyReportFormSchema = z.infer<
  typeof createWeeklyReportFormSchema
>
export type CreateWeeklyReportSchema = z.infer<typeof createWeeklyReportSchema>
