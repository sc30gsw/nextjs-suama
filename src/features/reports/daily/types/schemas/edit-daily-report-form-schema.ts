import * as z from 'zod/v4'
import {
  appealEntrySchema,
  dailyReportEntrySchema,
  troubleEntrySchema,
} from '~/features/reports/daily/types/schemas/create-daily-report-form-schema'

export const updateDailyReportFormSchema = z
  .object({
    reportId: z.uuid(),
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
    // アピールエントリーのバリデーション
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

    // トラブルエントリーのバリデーション
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

export type UpdateDailyReportFormSchema = z.infer<typeof updateDailyReportFormSchema>
export type UpdateDailyReportEntrySchema = z.infer<typeof dailyReportEntrySchema>
