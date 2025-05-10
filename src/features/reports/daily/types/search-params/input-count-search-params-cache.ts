import { createSearchParamsCache, parseAsInteger } from 'nuqs/server'

export const inputCountSearchParamsParsers = {
  count: parseAsInteger.withDefault(1),
}

export const inputCountSearchParamsCache = createSearchParamsCache(
  inputCountSearchParamsParsers,
)
