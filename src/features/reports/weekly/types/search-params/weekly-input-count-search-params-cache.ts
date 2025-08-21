import { createSearchParamsCache, parseAsBoolean, parseAsJson } from 'nuqs/server'
import { z } from 'zod'

const weeklyReportEntrySchema = z.object({
  id: z.string().uuid(),
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

export type WeeklyInputCountSearchParams = typeof weeklyInputCountSearchParamsParsers

export type UpdateWeeklyInputCountSearchParams = Omit<WeeklyInputCountSearchParams, 'isReference'>

export const weeklyInputCountSearchParamsCache = createSearchParamsCache(
  weeklyInputCountSearchParamsParsers,
)
