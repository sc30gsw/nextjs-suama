import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server'

export const userRetireStatus = ['all', 'active', 'retired'] as const

export const userSearchParamsParsers = {
  userNames: parseAsArrayOf(parseAsString).withDefault([]),
  retirementStatus: parseAsStringLiteral(userRetireStatus).withDefault('all'),
}

export const userSearchParamsCache = createSearchParamsCache(userSearchParamsParsers)
