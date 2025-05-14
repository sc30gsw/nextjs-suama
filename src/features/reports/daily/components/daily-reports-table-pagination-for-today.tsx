'use client'

import { useQueryStates } from 'nuqs'
import { Pagination } from '~/components/ui/intent-ui/pagination'
import { dailyReportForTodaySearchParamsParsers } from '~/features/reports/daily/types/search-params/daily-report-for-today-search-params-cache'

export function DailyReportsTablePaginationForToday({
  pageCount,
  page,
}: Record<'pageCount' | 'page', number>) {
  const pageIndex = page <= 1 ? 0 : page - 1
  const [{ userNames }] = useQueryStates(
    dailyReportForTodaySearchParamsParsers,
    {
      history: 'push',
      shallow: false,
    },
  )

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

    return pageCount <= 7
      ? Array.from({ length: pageCount }, (_, i) => i)
      : result
  }

  const pages = createPageNumbers()

  return (
    <Pagination>
      <Pagination.List>
        <Pagination.Item
          routerOptions={{ scroll: false }}
          segment="first"
          href={
            userNames.length > 0 ? `?page=1&userNames=${userNames}` : '?page=1'
          }
          isDisabled={pageIndex === 0}
        />
        <Pagination.Item
          routerOptions={{ scroll: false }}
          href={
            userNames.length > 0
              ? `?page=${pageIndex}&userNames=${userNames}`
              : `?page=${pageIndex}`
          }
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
          {(item) =>
            typeof item.value === 'number' ? (
              <Pagination.Item
                key={item.id}
                routerOptions={{ scroll: false }}
                href={
                  userNames.length > 0
                    ? `?page=${item.value + 1}&userNames=${userNames}`
                    : `?page=${item.value + 1}`
                }
                isCurrent={item.value === pageIndex}
              >
                {item.value + 1}
              </Pagination.Item>
            ) : (
              <Pagination.Item
                key={item.id}
                isDisabled={true}
                routerOptions={{ scroll: false }}
                segment="ellipsis"
              >
                …
              </Pagination.Item>
            )
          }
        </Pagination.Section>
        <Pagination.Item
          routerOptions={{ scroll: false }}
          href={
            userNames.length > 0
              ? `?page=${pageIndex + 2}&userNames=${userNames}`
              : `?page=${pageIndex + 2}`
          }
          segment="next"
          isDisabled={pageIndex === pageCount - 1}
        />
        <Pagination.Item
          routerOptions={{ scroll: false }}
          href={
            userNames.length > 0
              ? `?page=${pageCount}&userNames=${userNames}`
              : `?page=${pageCount}`
          }
          segment="last"
          isDisabled={pageIndex === pageCount - 1}
        />
      </Pagination.List>
    </Pagination>
  )
}
