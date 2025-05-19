import { z } from 'zod'

export const weeklyReportSchema = z.object({
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

export const weeklyReportFormSchema = z.object({
  year: z.number(),
  week: z.number(),
  weeklyReports: z
    .array(weeklyReportSchema)
    .min(1, '週報の内容は1件以上必要です'),
})

export type WeeklyReportFormSchema = z.infer<typeof weeklyReportFormSchema>
export type WeeklyReportSchema = z.infer<typeof weeklyReportSchema>
