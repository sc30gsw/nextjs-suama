import { useEffect, useState } from 'react'
import { Events, Link as ScrollLink, scrollSpy } from 'react-scroll'
import { Heading } from '~/components/ui/intent-ui/heading'
import type { useWeeklyReportsQuery } from '~/features/reports/weekly/hooks/use-weekly-reports-query'
import { cn } from '~/utils/classes'
import { throttle } from '~/utils/throttle'

export function WeeklyReportsNavigation({
  data,
}: Record<
  'data',
  Exclude<ReturnType<typeof useWeeklyReportsQuery>['data'], undefined>
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
    <aside className="w-64 sticky top-20 h-fit hidden lg:block pr-4">
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
                'px-2 my-1 transition-colors cursor-pointer',
                activeId === `user-${report.user.id}`
                  ? 'text-white font-semibold'
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
