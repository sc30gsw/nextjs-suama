'use client'

import { useQueryStates } from 'nuqs'
import { Pagination } from '~/components/ui/intent-ui/pagination'
import { PAGINATION } from '~/constants/pagination'
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
    page <= PAGINATION.FIRST_PAGE.NUMBER
      ? PAGINATION.FIRST_PAGE.INDEX
      : page - PAGINATION.PAGE_OFFSET

  const lastPageIndex = pageCount - PAGINATION.PAGE_OFFSET

  const isFirstPage = currentPageIndex === PAGINATION.FIRST_PAGE.INDEX
  const isLastPage = currentPageIndex === lastPageIndex

  const pageNumbers = paginationUtils.createPageNumbers(currentPageIndex, pageCount)

  return (
    <Pagination>
      <Pagination.List>
        <Pagination.Item
          segment="first"
          onAction={() => setPaginationParams({ page: PAGINATION.FIRST_PAGE.NUMBER, rowsPerPage })}
          isDisabled={isFirstPage}
        />

        <Pagination.Item
          segment="previous"
          onAction={() =>
            setPaginationParams({
              page: page - PAGINATION.PAGE_OFFSET,
              rowsPerPage,
            })
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
                      page: pageIndex + PAGINATION.PAGE_OFFSET,
                      rowsPerPage,
                    })
                  }
                  isCurrent={pageIndex === currentPageIndex}
                >
                  {pageIndex + PAGINATION.PAGE_OFFSET}
                </Pagination.Item>
              )
            }

            return <Pagination.Item key={item.id} isDisabled segment="ellipsis" />
          }}
        </Pagination.Section>

        <Pagination.Item
          segment="next"
          onAction={() =>
            setPaginationParams({
              page: page + PAGINATION.PAGE_OFFSET,
              rowsPerPage,
            })
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
