import { createSearchParamsCache, parseAsInteger } from 'nuqs/server'

export const paginationSearchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  rowsPerPage: parseAsInteger.withDefault(10),
}

export const paginationSearchParamsCache = createSearchParamsCache(
  paginationSearchParamsParsers,
)
