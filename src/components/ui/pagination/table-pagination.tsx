'use client'

import { useQueryStates } from 'nuqs'
import { Pagination } from '~/components/ui/intent-ui/pagination'
import { paginationSearchParamsParsers } from '~/types/search-params/pagination-search-params-cache'

export function TablePagination({ pageCount, page }: Record<'pageCount' | 'page', number>) {
  const pageIndex = page <= 1 ? 0 : page - 1

  const [{ rowsPerPage }, setPaginationParams] = useQueryStates(paginationSearchParamsParsers, {
    history: 'push',
    shallow: false,
  })

  const goToPage = (targetPage: number) => {
    setPaginationParams({ page: targetPage, rowsPerPage })
  }

  const createPageNumbers = () => {
    const last = pageCount - 1
    const result: (number | string)[] = []

    // 常に最初と最後のページは表示
    result.push(0)

    const pushResult = (start: number, end: number) => {
      for (let i = start; i <= end; i++) {
        result.push(i)
      }
    }

    // 現在のページ周辺のページを表示
    if (pageIndex <= 3) {
      pushResult(1, 3)
      result.push('...')
    } else if (pageIndex >= pageCount - 4) {
      result.push('...')
      pushResult(pageCount - 5, last - 1)
    } else {
      result.push('...')
      pushResult(pageIndex - 1, pageIndex + 1)
      result.push('...')
    }

    if (result[result.length - 1] !== last) {
      result.push(last)
    }

    return pageCount <= 7 ? Array.from({ length: pageCount }, (_, i) => i) : result
  }

  const pages = createPageNumbers()

  return (
    <Pagination>
      <Pagination.List>
        <Pagination.Item
          segment="first"
          onAction={() => goToPage(1)}
          isDisabled={pageIndex === 0}
        />
        <Pagination.Item
          onAction={() => goToPage(pageIndex)}
          segment="previous"
          isDisabled={pageIndex === 0}
        />
        <Pagination.Section
          aria-label="Pagination Segment"
          items={pages.map((p, id) => ({
            id: String(id),
            value: p,
          }))}
        >
          {(item) => {
            if (typeof item.value === 'number') {
              const pageNumber = item.value
              return (
                <Pagination.Item
                  key={item.id}
                  onAction={() => goToPage(pageNumber + 1)}
                  isCurrent={pageNumber === pageIndex}
                >
                  {pageNumber + 1}
                </Pagination.Item>
              )
            }
            return (
              <Pagination.Item key={item.id} isDisabled={true} segment="ellipsis">
                …
              </Pagination.Item>
            )
          }}
        </Pagination.Section>
        <Pagination.Item
          onAction={() => goToPage(pageIndex + 2)}
          segment="next"
          isDisabled={pageIndex === pageCount - 1}
        />
        <Pagination.Item
          onAction={() => goToPage(pageCount)}
          segment="last"
          isDisabled={pageIndex === pageCount - 1}
        />
      </Pagination.List>
    </Pagination>
  )
}
