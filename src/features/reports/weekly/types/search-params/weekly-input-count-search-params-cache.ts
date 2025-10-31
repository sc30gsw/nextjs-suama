import { createSearchParamsCache, parseAsBoolean, parseAsJson } from 'nuqs/server'
import * as z from 'zod/v4'

export const weeklyReportEntrySchema = z.object({
  id: z.uuid(),
  project: z.string(),
  mission: z.string(),
  hours: z.number(),
  content: z.string(),
})

export const weeklyReportStateSchema = z.object({
  count: z.number(),
  entries: z.array(weeklyReportEntrySchema),
})

export const weeklyInputCountSearchParamsParsers = {
  weeklyReportEntry: parseAsJson(weeklyReportStateSchema.parse).withDefault({
    count: 1,
    entries: [
      {
        id: crypto.randomUUID(),
        project: '',
        mission: '',
        hours: 0,
        content: '',
      },
    ],
  }),
  isReference: parseAsBoolean.withDefault(false),
}

export type WeeklyReportEntry = z.infer<typeof weeklyReportEntrySchema>
export type WeeklyInputCountSearchParams = typeof weeklyInputCountSearchParamsParsers
export type UpdateWeeklyInputCountSearchParams = Omit<WeeklyInputCountSearchParams, 'isReference'>

export const weeklyInputCountSearchParamsCache = createSearchParamsCache(
  weeklyInputCountSearchParamsParsers,
)
