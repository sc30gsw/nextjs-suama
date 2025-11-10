type PaginationConfig = {
  UI: typeof UI
  PAGE: typeof PAGE
  DISPLAY: typeof DISPLAY
  DIVIDING_PATTERN: typeof DIVIDING_PATTERN
  BOUNDARY: typeof BOUNDARY
  PARAMS: typeof PARAMS
  UTILS: typeof UTILS
}

const UI = {
  ELLIPSIS: '...',
} as const satisfies Record<string, string>

const PAGE = {
  FIRST: 1,
  FIRST_INDEX: 0,
  OFFSET: 1,
} as const satisfies Record<string, number>

const DISPLAY = {
  MAX_PAGES: 7,
  SIBLING_COUNT: 1,
} as const satisfies Record<string, number>

const DIVIDING_PATTERN = {
  POINT: 3,
} as const satisfies Record<string, number>

const BOUNDARY = {
  COUNT: 4,
} as const satisfies Record<string, number>

const PARAMS = {
  MAX_ROWS_PER_PAGE: 100,
  MIN_ROWS_PER_PAGE: 10,
  MAX_LIMIT: 500,
  DEFAULT_SKIP: 0,
  DEFAULT_LIMIT: 10,
} as const satisfies Record<string, number>

const UTILS = {
  calculateSkip: (page: number, rowsPerPage: number) => {
    if (page <= PAGE.FIRST) {
      return PAGE.FIRST_INDEX
    }

    return (page - PAGE.FIRST) * rowsPerPage
  },

  clampRowsPerPage: (rowsPerPage: number) => {
    const { MIN_ROWS_PER_PAGE, MAX_ROWS_PER_PAGE } = PARAMS

    if (rowsPerPage > MAX_ROWS_PER_PAGE) {
      return MAX_ROWS_PER_PAGE
    }

    if (rowsPerPage < MIN_ROWS_PER_PAGE) {
      return MIN_ROWS_PER_PAGE
    }

    return rowsPerPage
  },
} as const satisfies Record<string, (page: number, rowsPerPage: number) => number>

export const PAGINATION = {
  UI,
  PAGE,
  DISPLAY,
  DIVIDING_PATTERN,
  BOUNDARY,
  PARAMS,
  UTILS,
} as const satisfies PaginationConfig
