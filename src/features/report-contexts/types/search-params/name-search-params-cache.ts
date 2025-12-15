import { createSearchParamsCache, parseAsArrayOf, parseAsString } from 'nuqs/server'
import { sortSearchParamsParsers } from '~/types/search-params/sort-search-params-cache'

export const nameSearchParamsParsers = {
  names: parseAsArrayOf(parseAsString).withDefault([]),
  ...sortSearchParamsParsers,
}

export const nameSearchParamsCache = createSearchParamsCache(nameSearchParamsParsers)
