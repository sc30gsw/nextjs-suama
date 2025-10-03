import { createSearchParamsCache, parseAsJson } from 'nuqs/server'
import { z } from 'zod'

const reportEntrySchema = z.object({
  id: z.string(),
  project: z.string().nullable(),
  mission: z.string().nullable(),
  hours: z.number(),
  content: z.string(),
})

const appealsAndTroublesEntrySchema = z.object({
  id: z.string(),
  content: z.string(),
  item: z.string().nullable(),
  resolved: z.boolean().optional(),
})

const inputStateSchema = z.object({
  count: z.number(),
  entries: z.array(appealsAndTroublesEntrySchema),
})

export const appealsAndTroublesStateSchema = z.object({
  appeals: inputStateSchema,
  troubles: inputStateSchema,
})

export const reportStateSchema = z.object({
  count: z.number(),
  entries: z.array(reportEntrySchema),
})

export const inputCountSearchParamsParsers = {
  reportEntry: parseAsJson(reportStateSchema.parse)
    .withDefault({
      count: 1,
      entries: [
        {
          id: crypto.randomUUID(),
          project: null,
          mission: null,
          hours: 0,
          content: '',
        },
      ],
    })
    .withOptions({ throttleMs: 1000 }),
  appealsAndTroublesEntry: parseAsJson(appealsAndTroublesStateSchema.parse)
    .withDefault({
      appeals: { count: 0, entries: [] },
      troubles: { count: 0, entries: [] },
    })
    .withOptions({ throttleMs: 1000 }),
}

export const inputCountSearchParamsCache = createSearchParamsCache(inputCountSearchParamsParsers)

export type DailyInputCountSearchParams = typeof inputCountSearchParamsParsers
export type AppealsAndTroublesEntry = z.infer<typeof appealsAndTroublesEntrySchema>
