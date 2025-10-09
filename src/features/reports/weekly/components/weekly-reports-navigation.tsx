import { useEffect, useState } from 'react'
import { Events, Link as ScrollLink, scrollSpy } from 'react-scroll'
import { Heading } from '~/components/ui/intent-ui/heading'
import type { fetchWeeklyReportsInfiniteQuery } from '~/features/reports/weekly/queries/fetcher'
import { cn } from '~/utils/classes'
import { throttle } from '~/utils/throttle'

export function WeeklyReportsNavigation({
  data,
}: Record<
  'data',
  Exclude<ReturnType<ReturnType<typeof fetchWeeklyReportsInfiniteQuery>['use']>['data'], undefined>
>) {
  const [activeId, setActiveId] = useState('')

  const throttledSetActive = throttle((to: string) => {
    setActiveId((prev) => (prev !== to ? to : prev))
  }, 100)

  useEffect(() => {
    scrollSpy.update()

    return () => {
      Events.scrollEvent.remove('begin')
      Events.scrollEvent.remove('end')
    }
  }, [])

  return (
    <aside className="sticky top-20 hidden h-fit w-64 pr-4 lg:block">
      <nav className="flex flex-col gap-1 text-sm">
        <Heading level={5}>On this page</Heading>
        {data.pages.flatMap((page) =>
          page.reports.map((report) => (
            <ScrollLink
              key={report.user.id}
              to={`user-${report.user.id}`}
              spy={true}
              smooth={true}
              offset={-80}
              duration={300}
              onSetActive={throttledSetActive}
              className={cn(
                'my-1 cursor-pointer px-2 transition-colors',
                activeId === `user-${report.user.id}`
                  ? 'font-semibold text-white'
                  : 'text-muted-fg hover:text-white',
              )}
            >
              {report.user.name}
            </ScrollLink>
          )),
        )}
      </nav>
    </aside>
  )
}
