import { createSearchParamsCache, parseAsJson } from 'nuqs/server'
import { z } from 'zod'

const entrySchema = z.object({
  id: z.string(),
  content: z.string(),
  item: z.number().nullable(),
  resolved: z.boolean(),
})

const inputStateSchema = z.object({
  count: z.number(),
  entries: z.array(entrySchema),
})

export const reportStateSchema = z.object({
  appeals: inputStateSchema,
  troubles: inputStateSchema,
})

export const inputCountSearchParamsParsers = {
  // count: parseAsInteger.withDefault(1),
  appealsAndTroublesEntry: parseAsJson(reportStateSchema.parse).withDefault({
    appeals: { count: 0, entries: [] },
    troubles: { count: 0, entries: [] },
  }),
}

export const inputCountSearchParamsCache = createSearchParamsCache(
  inputCountSearchParamsParsers,
)
