import { createSearchParamsCache, parseAsArrayOf, parseAsString } from 'nuqs/server'

export const nameSearchParamsParsers = {
  names: parseAsArrayOf(parseAsString).withDefault([]),
}

export const nameSearchParamsCache = createSearchParamsCache(nameSearchParamsParsers)
