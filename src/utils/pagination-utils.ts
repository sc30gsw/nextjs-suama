import type { ELLIPSIS } from '~/constants/pagination'
import { NEAR_END_THRESHOLD, NEAR_START_THRESHOLD } from '~/constants/pagination'

export const paginationUtils = {
  addPagesToArray: (pages: (number | typeof ELLIPSIS)[], start: number, end: number) => {
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  },

  getPagePattern: (currentPageIndex: number, totalPages: number) => {
    if (currentPageIndex <= NEAR_START_THRESHOLD) {
      return 'START'
    }

    if (currentPageIndex >= totalPages - NEAR_END_THRESHOLD) {
      return 'END'
    }

    return 'MIDDLE'
  },
} as const
