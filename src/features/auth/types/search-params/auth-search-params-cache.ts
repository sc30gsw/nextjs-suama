import { createSearchParamsCache, parseAsString } from 'nuqs/server'

export const authSearchParamsParsers = {
  token: parseAsString,
}

export const authSearchParamsCache = createSearchParamsCache(authSearchParamsParsers)
