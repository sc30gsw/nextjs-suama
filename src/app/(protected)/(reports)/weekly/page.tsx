import { IconChevronLgRight } from '@intentui/icons'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Button } from '~/components/ui/intent-ui/button'
import { LinkLoadingIndicator } from '~/components/ui/link-loading-indicator'
import { MonthSelector } from '~/features/reports/weekly/components/month-selector'
import { WeekRangeCalendar } from '~/features/reports/weekly/components/weeks-range-calendar'
import { monthSelectSearchParamsCache } from '~/features/reports/weekly/types/search-params/month-select-search-params-cache'
import { getWeeksByMonth } from '~/features/reports/weekly/utils/date-utils'

import type { NextPageProps } from '~/types'

export default async function WeeklyPage({
  searchParams,
}: NextPageProps<undefined, SearchParams>) {
  const { month } = await monthSelectSearchParamsCache.parse(searchParams)

  const selectedWeeksByMonth = getWeeksByMonth().find(
    (weeks) => weeks.month === month,
  )

  if (!selectedWeeksByMonth) {
    notFound()
  }

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-y-2">
      <div className="w-full flex items-center justify-center my-4">
        <MonthSelector
          months={getWeeksByMonth().map(({ month }) => ({
            name: month,
          }))}
        />
      </div>
      <div className="grid lg:grid-cols-4 md:grid-cols-2 gird-cols-1 grid-rows-2 gap-8 mx-auto py-2">
        {selectedWeeksByMonth.weeks.map((week) => (
          <div key={week.weekNumber}>
            <WeekRangeCalendar startDay={week.startDay} endDay={week.endDay} />
            <div className="flex justify-end items-center">
              <Button size="extra-small" className="mt-2">
                <Link
                  href={`/weekly/list/${format(week.startDay, 'yyyy-MM-dd', { locale: ja })}-${format(week.endDay, 'yyyy-MM-dd', { locale: ja })}`}
                  prefetch={false}
                  className="flex items-center justify-end gap-x-1.5"
                >
                  第{week.weekNumber}
                  週の週報を確認する
                  <LinkLoadingIndicator>
                    <IconChevronLgRight />
                  </LinkLoadingIndicator>
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
