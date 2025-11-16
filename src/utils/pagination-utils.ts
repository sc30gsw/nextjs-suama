import { PAGE_OFFSET, PAGINATION } from '~/constants/pagination'

const ELLIPSIS = '...'
const PAGE_PATTERN = {
  START: 'START',
  MIDDLE: 'MIDDLE',
  END: 'END',
} as const satisfies Record<string, string>

function addPagesToArray(pages: (number | typeof ELLIPSIS)[], start: number, end: number) {
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
}

function getPagePattern(
  ...[currentPageIndex, totalPages]: Parameters<typeof paginationUtils.createPageNumbers>
) {
  if (currentPageIndex <= PAGINATION.DIVIDING_POINT) {
    return PAGE_PATTERN.START
  }

  if (currentPageIndex >= totalPages - PAGINATION.BOUNDARY_COUNT) {
    return PAGE_PATTERN.END
  }

  return PAGE_PATTERN.MIDDLE
}

export const paginationUtils = {
  createPageNumbers: (currentPageIndex: number, totalPage: number) => {
    if (totalPage <= PAGINATION.DISPLAY.MAX_PAGES) {
      return Array.from({ length: totalPage }, (_, i) => i)
    }

    const lastPageIndex = totalPage - PAGE_OFFSET

    const pages: (number | typeof ELLIPSIS)[] = []

    const pattern = getPagePattern(currentPageIndex, totalPage)

    switch (pattern) {
      case PAGE_PATTERN.START:
        addPagesToArray(pages, PAGINATION.FIRST_PAGE.INDEX, PAGINATION.BOUNDARY_COUNT - PAGE_OFFSET)
        pages.push(ELLIPSIS, lastPageIndex)

        break

      case PAGE_PATTERN.MIDDLE:
        pages.push(PAGINATION.FIRST_PAGE.INDEX, ELLIPSIS)
        addPagesToArray(
          pages,
          currentPageIndex - PAGINATION.DISPLAY.SIBLING_COUNT,
          currentPageIndex + PAGINATION.DISPLAY.SIBLING_COUNT,
        )
        pages.push(ELLIPSIS, lastPageIndex)

        break

      case PAGE_PATTERN.END:
        pages.push(PAGINATION.FIRST_PAGE.INDEX, ELLIPSIS)
        addPagesToArray(
          pages,
          lastPageIndex - PAGINATION.BOUNDARY_COUNT + PAGE_OFFSET,
          lastPageIndex,
        )

        break
    }

    return pages
  },

  getOffset: (page: number, rowsPerPage: number) => {
    if (page <= PAGINATION.FIRST_PAGE.NUMBER) {
      return PAGINATION.FIRST_PAGE.INDEX
    }

    return (page - PAGINATION.FIRST_PAGE.NUMBER) * rowsPerPage
  },

  getMaxRowsLimit: (rowsPerPage: number) => {
    const { MIN_ROWS_PER_PAGE, MAX_ROWS_PER_PAGE } = PAGINATION.VALUES.LIMITS

    if (rowsPerPage > MAX_ROWS_PER_PAGE) {
      return MAX_ROWS_PER_PAGE
    }

    if (rowsPerPage < MIN_ROWS_PER_PAGE) {
      return MIN_ROWS_PER_PAGE
    }

    return rowsPerPage
  },
} as const satisfies Record<string, (...args: number[]) => unknown>
