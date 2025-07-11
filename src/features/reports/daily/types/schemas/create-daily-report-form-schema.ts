import { z } from 'zod'

// 個別のレポートエントリー（ミッション情報）
export const dailyReportEntrySchema = z.object({
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

// アピールエントリー
export const appealEntrySchema = z.object({
  id: z.string().uuid(),
  categoryId: z.string().optional(),
  content: z.string().optional(),
})

// トラブルエントリー
export const troubleEntrySchema = z.object({
  id: z.string().uuid(),
  categoryId: z.string().optional(),
  content: z.string().optional(),
})

// メインのフォームスキーマ
export const createDailyReportFormSchema = z
  .object({
    reportDate: z.string({ required_error: '日付を選択してください' }),
    remote: z
      .union([z.literal('on'), z.undefined()])
      .optional()
      .transform((val) => val === 'on'),
    impression: z.string().optional(),
    reportEntries: z.array(dailyReportEntrySchema).min(1, '業務内容は1件以上必要です'),
    appealEntries: z.array(appealEntrySchema).default([]),
    troubleEntries: z.array(troubleEntrySchema).default([]),
  })
  .superRefine((data, ctx) => {
    // アピールエントリーのバリデーション
    data.appealEntries.forEach((entry, index) => {
      if (entry.content && entry.content.length > 0) {
        if (!entry.categoryId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'カテゴリーを選択してください',
            path: ['appealEntries', index, 'categoryId'],
          })
        }

        if (entry.content.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: '内容を入力してください',
            path: ['appealEntries', index, 'content'],
          })
        }

        if (entry.content.length > 256) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: '内容は256文字以下で入力してください',
            path: ['appealEntries', index, 'content'],
          })
        }
      }
    })

    // トラブルエントリーのバリデーション
    data.troubleEntries.forEach((entry, index) => {
      if (entry.content && entry.content.length > 0) {
        if (!entry.categoryId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'カテゴリーを選択してください',
            path: ['troubleEntries', index, 'categoryId'],
          })
        }

        if (entry.content.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: '内容を入力してください',
            path: ['troubleEntries', index, 'content'],
          })
        }

        if (entry.content.length > 256) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: '内容は256文字以下で入力してください',
            path: ['troubleEntries', index, 'content'],
          })
        }
      }
    })
  })

export type CreateDailyReportFormSchema = z.infer<typeof createDailyReportFormSchema>
export type DailyReportEntrySchema = z.infer<typeof dailyReportEntrySchema>
// export type AppealEntrySchema = z.infer<typeof appealEntrySchema>
// export type TroubleEntrySchema = z.infer<typeof troubleEntrySchema>
