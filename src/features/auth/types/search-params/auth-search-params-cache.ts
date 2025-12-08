import { createSearchParamsCache, parseAsString } from 'nuqs/server'

export const authSearchParamsParsers = {
  token: parseAsString,
  from: parseAsString,
}

export const authSearchParamsCache = createSearchParamsCache(authSearchParamsParsers)
