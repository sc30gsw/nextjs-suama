type PaginationConfig = {
  UI: typeof UI
  PAGE: typeof PAGE
  DISPLAY: typeof DISPLAY
  DIVIDING_PATTERN: typeof DIVIDING_PATTERN
  BOUNDARY: typeof BOUNDARY
}

const UI = {
  ELLIPSIS: '...',
} as const

const PAGE = {
  FIRST: 1,
  FIRST_INDEX: 0,
  OFFSET: 1,
} as const

const DISPLAY = {
  MAX_PAGES: 7,
  SIBLING_COUNT: 1,
} as const

const DIVIDING_PATTERN = {
  POINT: 3,
} as const

const BOUNDARY = {
  COUNT: 4,
} as const

export const PAGINATION = {
  UI,
  PAGE,
  DISPLAY,
  DIVIDING_PATTERN,
  BOUNDARY,
} as const satisfies PaginationConfig
