import { createSearchParamsCache, parseAsInteger } from 'nuqs/server'

export const inputCountSearchParamsParsers = {
  count: parseAsInteger.withDefault(1),
  troubleCount: parseAsInteger.withDefault(0),
  appealCount: parseAsInteger.withDefault(0),
}

export const inputCountSearchParamsCache = createSearchParamsCache(
  inputCountSearchParamsParsers,
)
