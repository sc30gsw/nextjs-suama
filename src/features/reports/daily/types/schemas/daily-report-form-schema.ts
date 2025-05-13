import { z } from 'zod'

const singleHourSchema = z
  .string()
  .transform((value) => Number(value))
  .refine((data) => data > 0, '0より大きい数値で入力してください')
const singleWorkContentSchema = z
  .string()
  .min(1, '内容を入力してください')
  .max(255, '内容は255文字以下で入力してください')
const singleAppealSchema = z
  .string()
  .optional()
  .refine((data) => {
    if (data && data.length > 0) {
      return data.length <= 256
    }
    return true
  }, '内容は256文字以下で入力してください')
const singleTroubleSchema = z
  .string()
  .optional()
  .refine((data) => {
    if (data && data.length > 0) {
      return data.length <= 256
    }
    return true
  }, '内容は256文字以下で入力してください')

const multipleHoursSchema = z.array(singleHourSchema)
const multipleWorkContentSchema = z.array(singleWorkContentSchema)
const multipleAppealSchema = z.array(singleAppealSchema)
const multipleTroubleSchema = z.array(singleTroubleSchema)

export const dailyReportFormSchema = z.object({
  reportDate: z.preprocess(
    (value) => {
      if (typeof value === 'string') {
        const date = new Date(value)
        return Number.isNaN(date.getTime()) ? undefined : date
      }
      return value
    },
    z
      .date()
      .refine(
        (date) => date !== undefined && !Number.isNaN(date.getTime()),
        '有効な日付を選択してください',
      ),
  ),
  workContent: z
    .union([singleWorkContentSchema, multipleWorkContentSchema])
    .refine(
      (data) =>
        Array.isArray(data) ? data.every((d) => d.length > 0) : data.length > 0,
      {
        message: '内容を入力してください',
      },
    ),
  hours: z
    .union([singleHourSchema, multipleHoursSchema])
    .refine(
      (data) => (Array.isArray(data) ? data.every((d) => d > 0) : data > 0),
      {
        message: '0より大きい数値で入力してください',
      },
    ),
  appeal: z.union([singleAppealSchema, multipleAppealSchema]).refine(
    (data) =>
      Array.isArray(data)
        ? data.every((d) => {
            if (d) {
              return d.length <= 256
            }
            return true
          })
        : true,
    {
      message: '内容は256文字以下で入力してください',
    },
  ),
  trouble: z.union([singleTroubleSchema, multipleTroubleSchema]).refine(
    (data) =>
      Array.isArray(data)
        ? data.every((d) => {
            if (d) {
              return d.length <= 256
            }
            return true
          })
        : true,
    {
      message: '内容は256文字以下で入力してください',
    },
  ),
})

export type DailyReportFormSchema = z.infer<typeof dailyReportFormSchema>
