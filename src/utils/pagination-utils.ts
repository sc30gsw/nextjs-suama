import { PAGINATION_CONFIG, PAGINATION_UI } from '~/constants/pagination'

const PAGE_PATTERN = {
  START: 'START',
  MIDDLE: 'MIDDLE',
  END: 'END',
} as const

function addPagesToArray(
  pages: (number | typeof PAGINATION_UI.ELLIPSIS)[],
  start: number,
  end: number,
) {
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
}

function getPagePattern(currentPageIndex: number, totalPages: number) {
  if (currentPageIndex <= PAGINATION_CONFIG.START_PATTERN_MAX_INDEX) {
    return PAGE_PATTERN.START
  }

  if (currentPageIndex >= totalPages - PAGINATION_CONFIG.END_PATTERN_MIN_OFFSET) {
    return PAGE_PATTERN.END
  }

  return PAGE_PATTERN.MIDDLE
}

export const paginationUtils = {
  createPageNumbers: (currentPageIndex: number, totalPages: number) => {
    if (totalPages <= PAGINATION_CONFIG.MAX_VISIBLE_PAGE_NUMBERS) {
      return Array.from({ length: totalPages }, (_, i) => i)
    }

    const lastPageIndex = totalPages - PAGINATION_CONFIG.PAGE_INDEX_DIFF

    const pages: (number | typeof PAGINATION_UI.ELLIPSIS)[] = []

    const pattern = getPagePattern(currentPageIndex, totalPages)

    switch (pattern) {
      case PAGE_PATTERN.START:
        addPagesToArray(
          pages,
          PAGINATION_CONFIG.FIRST_PAGE_INDEX,
          PAGINATION_CONFIG.START_SECTION_LAST_INDEX,
        )
        pages.push(PAGINATION_UI.ELLIPSIS, lastPageIndex)

        break

      case PAGE_PATTERN.MIDDLE:
        pages.push(PAGINATION_CONFIG.FIRST_PAGE_INDEX, PAGINATION_UI.ELLIPSIS)
        addPagesToArray(
          pages,
          currentPageIndex - PAGINATION_CONFIG.PAGES_AROUND_CURRENT,
          currentPageIndex + PAGINATION_CONFIG.PAGES_AROUND_CURRENT,
        )
        pages.push(PAGINATION_UI.ELLIPSIS, lastPageIndex)

        break

      case PAGE_PATTERN.END:
        pages.push(PAGINATION_CONFIG.FIRST_PAGE_INDEX, PAGINATION_UI.ELLIPSIS)
        addPagesToArray(pages, totalPages - PAGINATION_CONFIG.END_SECTION_PAGE_COUNT, lastPageIndex)

        break
    }

    return pages
  },
} as const
