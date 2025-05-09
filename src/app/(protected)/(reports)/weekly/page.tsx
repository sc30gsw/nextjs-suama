import { fromDate, getLocalTimeZone } from '@internationalized/date'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Button } from '~/components/ui/intent-ui/button'
import { Heading } from '~/components/ui/intent-ui/heading'
import { LinkLoadingIndicator } from '~/components/ui/link-loading-indicator'
import { MonthSelector } from '~/features/reports/weekly/components/month-selector'
import { WeekRangeCalendar } from '~/features/reports/weekly/components/weeks-range-calendar'
import { monthSelectSearchParamsCache } from '~/features/reports/weekly/types/search-params/month-select-search-params-cache'
import { getWeeksByMonth } from '~/features/reports/weekly/utils/get-weeks-by-month'

export default async function WeeklyPage({
  searchParams,
}: Record<'searchParams', Promise<SearchParams>>) {
  const { month } = await monthSelectSearchParamsCache.parse(searchParams)

  const selectedWeeksByMonth = getWeeksByMonth().find(
    (weeks) => weeks.month === month,
  )

  if (!selectedWeeksByMonth) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-y-2">
      <div className="w-full flex items-center justify-center my-4">
        <MonthSelector
          months={getWeeksByMonth().map(({ month }) => ({
            name: month,
          }))}
        />
      </div>
      <Heading level={2} className="text-muted-fg text-center">
        {selectedWeeksByMonth.year}年{selectedWeeksByMonth.month}月の週報
      </Heading>
      <div className="grid lg:grid-cols-4 md:grid-cols-2 gird-cols-1 grid-rows-2 gap-8 mx-auto py-2">
        {selectedWeeksByMonth.weeks.map((week) => (
          <div key={week.weekNumber}>
            <WeekRangeCalendar
              start={fromDate(week.startDay, getLocalTimeZone())}
              end={fromDate(week.endDay, getLocalTimeZone())}
            />
            <div className="flex justify-end items-center">
              <Button size="extra-small" className="mt-2">
                <Link
                  href={`/reports/weekly/${week.weekNumber}`}
                  prefetch={false}
                  className="flex items-center justify-end gap-x-1.5"
                >
                  第{week.weekNumber}
                  週の週報を確認する
                  <LinkLoadingIndicator />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
