'use client'

import { type CalendarDate, parseDate } from '@internationalized/date'
import { format } from 'date-fns'
import { useQueryStates } from 'nuqs'
import { DateRangePicker } from '~/components/ui/intent-ui/date-range-picker'
import { dailyReportForMineSearchParamsParsers } from '~/features/reports/daily/types/search-params/daily-report-for-mine-search-params'

export function DailySearchDateRangePicker() {
  const [{ startDate, endDate }] = useQueryStates(dailyReportForMineSearchParamsParsers)

  const defaultValue =
    startDate && endDate
      ? ({
          start: parseDate(format(startDate, 'yyyy-MM-dd')),
          end: parseDate(format(endDate, 'yyyy-MM-dd')),
        } as const satisfies Record<string, CalendarDate>)
      : undefined

  return (
    <DateRangePicker
      defaultValue={defaultValue}
      startName="startDate"
      endName="endDate"
      className="w-full max-w-64"
    />
  )
}
