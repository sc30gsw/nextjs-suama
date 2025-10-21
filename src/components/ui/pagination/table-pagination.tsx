'use client'

import { useQueryStates } from 'nuqs'
import { Pagination } from '~/components/ui/intent-ui/pagination'
import { paginationSearchParamsParsers } from '~/types/search-params/pagination-search-params-cache'
import {
  END_SECTION_OFFSET,
  FIRST_PAGE,
  FULL_DISPLAY_THRESHOLD,
  PAGES_AROUND_CURRENT,
  paginationUtils,
  START_SECTION_OFFSET,
} from '~/utils/pagination-utils'

export function TablePagination({ pageCount }: Record<'pageCount', number>) {
  const [{ page, rowsPerPage }, setPaginationParams] = useQueryStates(
    paginationSearchParamsParsers,
    {
      history: 'push',
      shallow: false,
    },
  )

  const goToPage = (targetPage: number) => {
    setPaginationParams({ page: targetPage, rowsPerPage })
  }

  const createPageNumbers = (currentPage: number, totalPages: number) => {
    if (totalPages <= FULL_DISPLAY_THRESHOLD) {
      return Array.from({ length: totalPages }, (_, i) => i)
    }

    const currentPageIndex = currentPage <= FIRST_PAGE ? 0 : currentPage - 1
    const lastPageIndex = totalPages - 1
    const pages: (number | string)[] = []

    // 常に最初と最後のページは表示
    pages.push(0)

    const pattern = paginationUtils.getPagePattern(currentPageIndex, totalPages)

    switch (pattern) {
      case 'START':
        paginationUtils.addPagesToArray(pages, FIRST_PAGE, START_SECTION_OFFSET)
        pages.push('...')

        break

      case 'END':
        pages.push('...')
        paginationUtils.addPagesToArray(
          pages,
          totalPages - END_SECTION_OFFSET,
          lastPageIndex - FIRST_PAGE,
        )

        break

      case 'MIDDLE':
        pages.push('...')
        paginationUtils.addPagesToArray(
          pages,
          currentPageIndex - PAGES_AROUND_CURRENT,
          currentPageIndex + PAGES_AROUND_CURRENT,
        )
        pages.push('...')

        break
    }

    if (pages[pages.length - 1] !== lastPageIndex) {
      pages.push(lastPageIndex)
    }

    return pages
  }

  const currentPageIndex = page <= FIRST_PAGE ? 0 : page - 1

  const pageNumbers = createPageNumbers(page, pageCount)

  return (
    <Pagination>
      <Pagination.List>
        <Pagination.Item
          segment="first"
          onAction={() => goToPage(FIRST_PAGE)}
          isDisabled={currentPageIndex === 0}
        />

        <Pagination.Item
          onAction={() => goToPage(page - 1)}
          segment="previous"
          isDisabled={currentPageIndex === 0}
        />

        <Pagination.Section
          aria-label="Pagination Segment"
          items={pageNumbers.map((pageNumber, id) => ({
            id: String(id),
            value: pageNumber,
          }))}
        >
          {(item) => {
            if (typeof item.value === 'number') {
              const pageIndex = item.value
              return (
                <Pagination.Item
                  key={item.id}
                  onAction={() => goToPage(pageIndex + 1)}
                  isCurrent={pageIndex === currentPageIndex}
                >
                  {pageIndex + 1}
                </Pagination.Item>
              )
            }

            return (
              <Pagination.Item key={item.id} isDisabled segment="ellipsis">
                …
              </Pagination.Item>
            )
          }}
        </Pagination.Section>

        <Pagination.Item
          onAction={() => goToPage(page + 1)}
          segment="next"
          isDisabled={currentPageIndex === pageCount - 1}
        />

        <Pagination.Item
          onAction={() => goToPage(pageCount)}
          segment="last"
          isDisabled={currentPageIndex === pageCount - 1}
        />
      </Pagination.List>
    </Pagination>
  )
}
