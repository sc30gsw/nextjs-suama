import { z } from 'zod/v4'

export const dailyReportEntrySchema = z.object({
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

export const appealEntrySchema = z.object({
  id: z.uuid(),
  categoryId: z.string().optional(),
  content: z.string().optional(),
})

export const troubleEntrySchema = z.object({
  id: z.uuid(),
  categoryId: z.string().optional(),
  content: z.string().optional(),
  resolved: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .transform((val) => val === 'true' || val === true)
    .default(false),
})

export const createDailyReportFormSchema = z
  .object({
    reportDate: z.string({ error: '日付を選択してください' }),
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
    data.appealEntries.forEach((entry, index) => {
      if (entry.content && entry.content.length > 0) {
        if (!entry.categoryId) {
          ctx.addIssue({
            code: 'custom',
            error: 'カテゴリーを選択してください',
            path: ['appealEntries', index, 'categoryId'],
          })
        }

        if (entry.content.length === 0) {
          ctx.addIssue({
            code: 'custom',
            error: '内容を入力してください',
            path: ['appealEntries', index, 'content'],
          })
        }

        if (entry.content.length > 256) {
          ctx.addIssue({
            code: 'custom',
            error: '内容は256文字以下で入力してください',
            path: ['appealEntries', index, 'content'],
          })
        }
      }
    })

    data.troubleEntries.forEach((entry, index) => {
      if (entry.content && entry.content.length > 0) {
        if (!entry.categoryId) {
          ctx.addIssue({
            code: 'custom',
            error: 'カテゴリーを選択してください',
            path: ['troubleEntries', index, 'categoryId'],
          })
        }

        if (entry.content.length === 0) {
          ctx.addIssue({
            code: 'custom',
            error: '内容を入力してください',
            path: ['troubleEntries', index, 'content'],
          })
        }

        if (entry.content.length > 256) {
          ctx.addIssue({
            code: 'custom',
            error: '内容は256文字以下で入力してください',
            path: ['troubleEntries', index, 'content'],
          })
        }
      }
    })
  })

export type CreateDailyReportFormSchema = z.infer<typeof createDailyReportFormSchema>
export type DailyReportEntrySchema = z.infer<typeof dailyReportEntrySchema>
