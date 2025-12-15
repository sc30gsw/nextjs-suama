import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server'
import { sortSearchParamsParsers } from '~/types/search-params/sort-search-params-cache'

const USER_RETIREMENT_STATUS = ['all', 'active', 'retired'] as const satisfies readonly string[]

export const userSearchParamsParsers = {
  userNames: parseAsArrayOf(parseAsString).withDefault([]),
  retirementStatus: parseAsStringLiteral(USER_RETIREMENT_STATUS).withDefault('all'),
  ...sortSearchParamsParsers,
}

export const userSearchParamsCache = createSearchParamsCache(userSearchParamsParsers)
