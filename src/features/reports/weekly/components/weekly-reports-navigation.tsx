import type { RefObject } from 'react'
import { useEffect, useState } from 'react'
import type { VirtuosoHandle } from 'react-virtuoso'
import { Heading } from '~/components/ui/intent-ui/heading'
import type { fetchWeeklyReportsInfiniteQuery } from '~/features/reports/weekly/queries/fetcher'
import { cn } from '~/utils/classes'
import { throttle } from '~/utils/throttle'

export function WeeklyReportsNavigation({
  data,
  virtuosoRef,
}: {
  data: Exclude<
    ReturnType<ReturnType<typeof fetchWeeklyReportsInfiniteQuery>['use']>['data'],
    undefined
  >
  virtuosoRef: RefObject<VirtuosoHandle | null>
}) {
  const [activeId, setActiveId] = useState('')

  const reports = data.pages.flatMap((page) => page.reports)

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

  useEffect(() => {
    const handleScroll = throttle(() => {
      const scrollPosition = window.scrollY + 100

      for (const report of reports) {
        const element = document.getElementById(`user-${report.user.id}`)

        if (!element) {
          continue
        }

        const { offsetTop, offsetHeight } = element

        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          setActiveId(`user-${report.user.id}`)

          break
        }
      }
    }, 100)

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [reports])

  return (
    <aside className="sticky top-20 hidden h-fit w-64 pr-4 lg:block">
      <nav className="flex flex-col gap-1 text-sm">
        <Heading level={5}>On this page</Heading>

        {reports.map((report, index) => (
          <button
            type="button"
            key={report.user.id}
            onClick={() => scrollToUser(index)}
            className={cn(
              'my-1 cursor-pointer select-none px-2 text-left transition-colors focus-visible:outline-none',
              activeId === `user-${report.user.id}`
                ? 'font-semibold text-fg'
                : 'text-muted-fg hover:text-fg',
            )}
          >
            {report.user.name}
          </button>
        ))}
      </nav>
    </aside>
  )
}
