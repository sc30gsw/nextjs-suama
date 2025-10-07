import type { RefObject } from 'react'
import { useEffect, useState } from 'react'
import type { VirtuosoHandle } from 'react-virtuoso'
import type { fetchWeeklyReportsInfiniteQuery } from '~/features/reports/weekly/queries/fetcher'
import { cn } from '~/utils/classes'
import { throttle } from '~/utils/throttle'

const SCROLL_OFFSET = 100
const ELEMENT_ID_PREFIX = 'user'

type WeeklyReportsNavigationButtonProps = {
  data: Exclude<
    ReturnType<ReturnType<typeof fetchWeeklyReportsInfiniteQuery>['use']>['data'],
    undefined
  >
  virtuosoRef: RefObject<VirtuosoHandle | null>
}

export function WeeklyReportsNavigationButton({
  data,
  virtuosoRef,
}: WeeklyReportsNavigationButtonProps) {
  const [activeId, setActiveId] = useState('')

  const reports = data.pages.flatMap((page) => page.reports)

  useEffect(() => {
    const handleScroll = throttle(() => {
      const scrollPosition = window.scrollY + SCROLL_OFFSET

      for (const report of reports) {
        const element = document.getElementById(`${ELEMENT_ID_PREFIX}-${report.user.id}`)

        if (!element) {
          continue
        }

        const { offsetTop, offsetHeight } = element

        const elementTop = offsetTop
        const elementBottom = offsetTop + offsetHeight
        const isInViewRange = scrollPosition >= elementTop && scrollPosition < elementBottom

        if (isInViewRange) {
          setActiveId(`${ELEMENT_ID_PREFIX}-${report.user.id}`)

          break
        }
      }
      // waitはマジックナンバーに当てはまらないためハードコーディング
    }, 100)

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      return window.removeEventListener('scroll', handleScroll)
    }
  }, [reports])

  const scrollToUser = (index: number) => {
    if (!virtuosoRef.current) {
      return
    }

    virtuosoRef.current.scrollToIndex({
      index,
      align: 'start',
      behavior: 'smooth',
    })
  }

  return reports.map((report, index) => (
    <button
      type="button"
      key={report.user.id}
      onClick={() => scrollToUser(index)}
      className={cn(
        'my-1 cursor-pointer select-none px-2 text-left transition-colors focus-visible:outline-none',
        activeId === `${ELEMENT_ID_PREFIX}-${report.user.id}`
          ? 'font-semibold text-fg'
          : 'text-muted-fg hover:text-fg',
      )}
    >
      {report.user.name}
    </button>
  ))
}
