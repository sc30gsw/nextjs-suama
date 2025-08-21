import { createSearchParamsCache, parseAsArrayOf, parseAsString } from 'nuqs/server'

export const userSearchParamsParsers = {
  userNames: parseAsArrayOf(parseAsString).withDefault([]),
}

export const userSearchParamsCache = createSearchParamsCache(userSearchParamsParsers)
