import { PAGINATION } from '~/constants/pagination'

const PAGE_PATTERN = {
  START: 'START',
  MIDDLE: 'MIDDLE',
  END: 'END',
} as const

function addPagesToArray(
  pages: (number | typeof PAGINATION.UI.ELLIPSIS)[],
  start: number,
  end: number,
) {
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
}

function getPagePattern(currentPageIndex: number, totalPages: number) {
  if (currentPageIndex <= PAGINATION.DIVIDING_PATTERN.POINT) {
    return PAGE_PATTERN.START
  }

  if (currentPageIndex >= totalPages - PAGINATION.BOUNDARY.COUNT) {
    return PAGE_PATTERN.END
  }

  return PAGE_PATTERN.MIDDLE
}

export const paginationUtils = {
  createPageNumbers: (currentPageIndex: number, totalPages: number) => {
    if (totalPages <= PAGINATION.DISPLAY.MAX_PAGES) {
      return Array.from({ length: totalPages }, (_, i) => i)
    }

    const lastPageIndex = totalPages - PAGINATION.PAGE.OFFSET

    const pages: (number | typeof PAGINATION.UI.ELLIPSIS)[] = []

    const pattern = getPagePattern(currentPageIndex, totalPages)

    switch (pattern) {
      case PAGE_PATTERN.START:
        addPagesToArray(
          pages,
          PAGINATION.PAGE.FIRST_INDEX,
          PAGINATION.BOUNDARY.COUNT - PAGINATION.PAGE.OFFSET,
        )
        pages.push(PAGINATION.UI.ELLIPSIS, lastPageIndex)

        break

      case PAGE_PATTERN.MIDDLE:
        pages.push(PAGINATION.PAGE.FIRST_INDEX, PAGINATION.UI.ELLIPSIS)
        addPagesToArray(
          pages,
          currentPageIndex - PAGINATION.DISPLAY.SIBLING_COUNT,
          currentPageIndex + PAGINATION.DISPLAY.SIBLING_COUNT,
        )
        pages.push(PAGINATION.UI.ELLIPSIS, lastPageIndex)

        break

      case PAGE_PATTERN.END:
        pages.push(PAGINATION.PAGE.FIRST_INDEX, PAGINATION.UI.ELLIPSIS)
        addPagesToArray(
          pages,
          lastPageIndex - PAGINATION.BOUNDARY.COUNT + PAGINATION.PAGE.OFFSET,
          lastPageIndex,
        )

        break
    }

    return pages
  },
} as const
