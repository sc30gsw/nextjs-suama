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

function getPagePattern(
  ...[currentPageIndex, totalPages]: Parameters<typeof paginationUtils.createPageNumbers>
) {
  if (currentPageIndex <= PAGINATION.DIVIDING_PATTERN.POINT) {
    return PAGE_PATTERN.START
  }

  if (currentPageIndex >= totalPages - PAGINATION.BOUNDARY.COUNT) {
    return PAGE_PATTERN.END
  }

  return PAGE_PATTERN.MIDDLE
}

type PaginationUtils = Readonly<{
  createPageNumbers: (
    currentPageIndex: number,
    totalPages: number,
  ) => (number | typeof PAGINATION.UI.ELLIPSIS)[]

  getOffeset: (page: number, rowsPerPage: number) => number

  getMaxRowsLimit: (rowsPerPage: number) => number
}>

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

  getOffeset: (page: number, rowsPerPage: number) => {
    if (page <= PAGINATION.PAGE.FIRST) {
      return PAGINATION.PAGE.FIRST_INDEX
    }

    return (page - PAGINATION.PAGE.FIRST) * rowsPerPage
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
} as const satisfies PaginationUtils
