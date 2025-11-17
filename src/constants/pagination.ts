type PaginationConfig = {
  FIRST_PAGE: typeof FIRST_PAGE
  DISPLAY: typeof DISPLAY
  PAGE_OFFSET: 1
  DIVIDING_POINT: 3
  BOUNDARY_COUNT: 4
  VALUES: {
    LIMITS: typeof LIMITS
  }
}

const FIRST_PAGE_NUMBER = 1
const FIRST_PAGE_INDEX = 0
const FIRST_PAGE = {
  NUMBER: FIRST_PAGE_NUMBER,
  INDEX: FIRST_PAGE_INDEX,
} as const satisfies Record<string, number>

const DISPLAY = {
  MAX_PAGES: 7,
  SIBLING_COUNT: 1,
} as const satisfies Record<string, number>

const LIMITS = {
  MAX_ROWS_PER_PAGE: 100,
  MIN_ROWS_PER_PAGE: 10,
} as const satisfies Record<string, number>

export const PAGINATION = {
  FIRST_PAGE,
  DISPLAY,
  PAGE_OFFSET: 1,
  DIVIDING_POINT: 3,
  BOUNDARY_COUNT: 4,
  VALUES: {
    LIMITS,
  },
} as const satisfies PaginationConfig
