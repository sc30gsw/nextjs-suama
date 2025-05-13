import { createSearchParamsCache, parseAsJson } from 'nuqs/server'
import { z } from 'zod'

const reportEntrySchema = z.object({
  id: z.string(),
  project: z.number().nullable(),
  mission: z.number().nullable(),
  hours: z.number(),
  content: z.string(),
})

const appealsAndTroublesEntrySchema = z.object({
  id: z.string(),
  content: z.string(),
  item: z.number().nullable(),
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
  reportEntry: parseAsJson(reportStateSchema.parse).withDefault({
    count: 0,
    entries: [],
  }),
  appealsAndTroublesEntry: parseAsJson(
    appealsAndTroublesStateSchema.parse,
  ).withDefault({
    appeals: { count: 0, entries: [] },
    troubles: { count: 0, entries: [] },
  }),
}

export const inputCountSearchParamsCache = createSearchParamsCache(
  inputCountSearchParamsParsers,
)
