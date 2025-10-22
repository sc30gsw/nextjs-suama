'use client'

import { useQueryStates } from 'nuqs'
import { Pagination } from '~/components/ui/intent-ui/pagination'
import {
  ELLIPSIS,
  END_SECTION_OFFSET,
  FIRST_PAGE,
  FIRST_PAGE_INDEX,
  FULL_DISPLAY_THRESHOLD,
  PAGE_INDEX_DIFF,
  PAGES_AROUND_CURRENT,
  START_SECTION_OFFSET,
} from '~/constants/pagination'
import { paginationSearchParamsParsers } from '~/types/search-params/pagination-search-params-cache'
import { paginationUtils } from '~/utils/pagination-utils'

export function TablePagination({ pageCount }: Record<'pageCount', number>) {
  const [{ page, rowsPerPage }, setPaginationParams] = useQueryStates(
    paginationSearchParamsParsers,
    {
      history: 'push',
      shallow: false,
    },
  )

  const createPageNumbers = (currentPageIndex: number, totalPages: number) => {
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
  }

  const currentPageIndex = page <= FIRST_PAGE ? FIRST_PAGE_INDEX : page - PAGE_INDEX_DIFF
  const lastPageIndex = pageCount - PAGE_INDEX_DIFF

  const isFirstPage = currentPageIndex === FIRST_PAGE_INDEX
  const isLastPage = currentPageIndex === lastPageIndex

  const pageNumbers = createPageNumbers(currentPageIndex, pageCount)

  const goToPage = (targetPage: number) => {
    setPaginationParams({ page: targetPage, rowsPerPage })
  }

  return (
    <Pagination>
      <Pagination.List>
        <Pagination.Item
          segment="first"
          onAction={() => goToPage(FIRST_PAGE)}
          isDisabled={isFirstPage}
        />

        <Pagination.Item
          segment="previous"
          onAction={() => goToPage(page - PAGE_INDEX_DIFF)}
          isDisabled={isFirstPage}
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
                  onAction={() => goToPage(pageIndex + PAGE_INDEX_DIFF)}
                  isCurrent={pageIndex === currentPageIndex}
                >
                  {pageIndex + PAGE_INDEX_DIFF}
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
          segment="next"
          onAction={() => goToPage(page + PAGE_INDEX_DIFF)}
          isDisabled={isLastPage}
        />

        <Pagination.Item
          segment="last"
          onAction={() => goToPage(pageCount)}
          isDisabled={isLastPage}
        />
      </Pagination.List>
    </Pagination>
  )
}
