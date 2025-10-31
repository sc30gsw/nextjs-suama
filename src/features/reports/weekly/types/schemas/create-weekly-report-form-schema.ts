import * as z from 'zod/v4'

export const createWeeklyReportSchema = z.object({
  id: z.uuid(),
  project: z.string({ error: 'プロジェクトを選択してください' }),
  mission: z.string({ error: 'ミッションを選択してください' }),
  content: z.string({ error: '内容を入力してください' }),
  hours: z
    .string()
    .transform((value) => Number(value))
    .refine((data) => data > 0, {
      error: '0より大きい数値で入力してください',
    }),
})

export const createWeeklyReportFormSchema = z.object({
  year: z.number(),
  week: z.number(),
  weeklyReports: z.array(createWeeklyReportSchema).min(1, '週報の内容は1件以上必要です'),
})

export type CreateWeeklyReportFormSchema = z.infer<typeof createWeeklyReportFormSchema>
export type CreateWeeklyReportSchema = z.infer<typeof createWeeklyReportSchema>
