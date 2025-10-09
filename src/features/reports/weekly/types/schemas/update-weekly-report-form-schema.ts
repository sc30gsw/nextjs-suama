import { z } from 'zod/v4'

export const updateWeeklyReportSchema = z.object({
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

export const updateWeeklyReportFormSchema = z.object({
  weeklyReportId: z.uuid(),
  weeklyReports: z.array(updateWeeklyReportSchema).min(1, '週報の内容は1件以上必要です'),
})

export type UpdateWeeklyReportFormSchema = z.infer<typeof updateWeeklyReportFormSchema>
export type UpdateWeeklyReportSchema = z.infer<typeof updateWeeklyReportSchema>
