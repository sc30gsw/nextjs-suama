export const FIRST_PAGE = 1
export const PAGES_AROUND_CURRENT = 1
export const FULL_DISPLAY_THRESHOLD = 7
export const NEAR_START_THRESHOLD = 3
export const NEAR_END_THRESHOLD = 4
export const START_SECTION_OFFSET = 3
export const END_SECTION_OFFSET = 5

export const paginationUtils = {
  addPagesToArray: (pages: (number | string)[], start: number, end: number) => {
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  },

  getPagePattern: (currentPageIndex: number, totalPages: number) => {
    if (currentPageIndex <= NEAR_START_THRESHOLD) return 'START'
    if (currentPageIndex >= totalPages - NEAR_END_THRESHOLD) return 'END'
    return 'MIDDLE'
  },
} as const
