'use client'

import { useQueryStates } from 'nuqs'
import { Pagination } from '~/components/ui/intent-ui/pagination'
import { PAGINATION_CONFIG, PAGINATION_UI } from '~/constants/pagination'
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

  const currentPageIndex =
    page <= PAGINATION_CONFIG.FIRST_PAGE
      ? PAGINATION_CONFIG.FIRST_PAGE_INDEX
      : page - PAGINATION_CONFIG.PAGE_INDEX_DIFF

  const lastPageIndex = pageCount - PAGINATION_CONFIG.PAGE_INDEX_DIFF

  const isFirstPage = currentPageIndex === PAGINATION_CONFIG.FIRST_PAGE_INDEX
  const isLastPage = currentPageIndex === lastPageIndex

  const pageNumbers = paginationUtils.createPageNumbers(currentPageIndex, pageCount)

  return (
    <Pagination>
      <Pagination.List>
        <Pagination.Item
          segment="first"
          onAction={() => setPaginationParams({ page: PAGINATION_CONFIG.FIRST_PAGE, rowsPerPage })}
          isDisabled={isFirstPage}
        />

        <Pagination.Item
          segment="previous"
          onAction={() =>
            setPaginationParams({ page: page - PAGINATION_CONFIG.PAGE_INDEX_DIFF, rowsPerPage })
          }
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
                  onAction={() =>
                    setPaginationParams({
                      page: pageIndex + PAGINATION_CONFIG.PAGE_INDEX_DIFF,
                      rowsPerPage,
                    })
                  }
                  isCurrent={pageIndex === currentPageIndex}
                >
                  {pageIndex + PAGINATION_CONFIG.PAGE_INDEX_DIFF}
                </Pagination.Item>
              )
            }

            return (
              <Pagination.Item key={item.id} isDisabled segment="ellipsis">
                {PAGINATION_UI.ELLIPSIS}
              </Pagination.Item>
            )
          }}
        </Pagination.Section>

        <Pagination.Item
          segment="next"
          onAction={() =>
            setPaginationParams({ page: page + PAGINATION_CONFIG.PAGE_INDEX_DIFF, rowsPerPage })
          }
          isDisabled={isLastPage}
        />

        <Pagination.Item
          segment="last"
          onAction={() => setPaginationParams({ page: pageCount, rowsPerPage })}
          isDisabled={isLastPage}
        />
      </Pagination.List>
    </Pagination>
  )
}
