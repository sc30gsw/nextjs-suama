import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server'

export const projectArchiveStatus = ['all', 'active', 'archived'] as const

export const projectSearchParamsParsers = {
  names: parseAsArrayOf(parseAsString).withDefault([]),
  archiveStatus: parseAsStringLiteral(projectArchiveStatus).withDefault('all'),
}

export const projectSearchParamsCache = createSearchParamsCache(projectSearchParamsParsers)
