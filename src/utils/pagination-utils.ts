import {
  ELLIPSIS,
  END_SECTION_OFFSET,
  FIRST_PAGE_INDEX,
  FULL_DISPLAY_THRESHOLD,
  NEAR_END_THRESHOLD,
  NEAR_START_THRESHOLD,
  PAGE_INDEX_DIFF,
  PAGES_AROUND_CURRENT,
  START_SECTION_OFFSET,
} from '~/constants/pagination'

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

  createPageNumbers: (currentPageIndex: number, totalPages: number) => {
    if (totalPages <= FULL_DISPLAY_THRESHOLD) {
      return Array.from({ length: totalPages }, (_, i) => i)
    }

    const lastPageIndex = totalPages - PAGE_INDEX_DIFF
    const pages: (number | typeof ELLIPSIS)[] = []
    const pattern = paginationUtils.getPagePattern(currentPageIndex, totalPages)

    switch (pattern) {
      case 'START':
        paginationUtils.addPagesToArray(pages, FIRST_PAGE_INDEX, START_SECTION_OFFSET)
        pages.push(ELLIPSIS, lastPageIndex)
        break

      case 'MIDDLE':
        pages.push(FIRST_PAGE_INDEX, ELLIPSIS)
        paginationUtils.addPagesToArray(
          pages,
          currentPageIndex - PAGES_AROUND_CURRENT,
          currentPageIndex + PAGES_AROUND_CURRENT,
        )
        pages.push(ELLIPSIS, lastPageIndex)

        break

      case 'END':
        pages.push(FIRST_PAGE_INDEX, ELLIPSIS)
        paginationUtils.addPagesToArray(pages, totalPages - END_SECTION_OFFSET, lastPageIndex)

        break
    }

    return pages
  },
} as const
