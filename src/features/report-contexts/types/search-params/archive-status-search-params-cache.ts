import { createSearchParamsCache, parseAsStringLiteral } from 'nuqs/server'

const ARCHIVE_STATUS = ['all', 'active', 'archived'] as const satisfies readonly string[]

export const archiveStatusParser = parseAsStringLiteral(ARCHIVE_STATUS).withDefault('all')

export const archiveStatusSearchParamsParsers = {
  archiveStatus: archiveStatusParser,
}

export const archiveStatusSearchParamsCache = createSearchParamsCache(
  archiveStatusSearchParamsParsers,
)
