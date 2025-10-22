'use client'

import { useQueryStates } from 'nuqs'
import { Pagination } from '~/components/ui/intent-ui/pagination'
import { ELLIPSIS, FIRST_PAGE, FIRST_PAGE_INDEX, PAGE_INDEX_DIFF } from '~/constants/pagination'
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

  const currentPageIndex = page <= FIRST_PAGE ? FIRST_PAGE_INDEX : page - PAGE_INDEX_DIFF
  const lastPageIndex = pageCount - PAGE_INDEX_DIFF

  const isFirstPage = currentPageIndex === FIRST_PAGE_INDEX
  const isLastPage = currentPageIndex === lastPageIndex

  const pageNumbers = paginationUtils.createPageNumbers(currentPageIndex, pageCount)

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
                {ELLIPSIS}
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
