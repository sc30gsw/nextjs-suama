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
import { getWeeksByMonth } from '~/features/reports/weekly/utils/weekly-date-utils'

import type { NextPageProps } from '~/types'
import { DATE_FORMAT } from '~/utils/date-utils'

export default async function WeeklyPage({ searchParams }: NextPageProps<undefined, SearchParams>) {
  const { month } = await monthSelectSearchParamsCache.parse(searchParams)

  const selectedWeeksByMonth = getWeeksByMonth().find((weeks) => weeks.month === month)

  if (!selectedWeeksByMonth) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-y-2 p-4 lg:p-6">
      <div className="my-4 flex w-full items-center justify-center">
        <MonthSelector
          months={getWeeksByMonth().map(({ month }) => ({
            name: month,
          }))}
        />
      </div>
      <div className="gird-cols-1 mx-auto grid grid-rows-2 gap-8 py-2 md:grid-cols-2 lg:grid-cols-4">
        {selectedWeeksByMonth.weeks.map((week) => (
          <div key={week.weekNumber}>
            <WeekRangeCalendar startDay={week.startDay} endDay={week.endDay} />
            <div className="flex items-center justify-end">
              <Button size="extra-small" className="mt-2">
                <Link
                  href={`/weekly/list/${format(week.startDay, DATE_FORMAT, { locale: ja })}-${format(week.endDay, DATE_FORMAT, { locale: ja })}`}
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
