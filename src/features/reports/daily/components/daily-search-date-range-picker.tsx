'use client'

import { type CalendarDate, parseDate } from '@internationalized/date'
import { useQueryStates } from 'nuqs'
import { DateRangePicker } from '~/components/ui/intent-ui/date-range-picker'
import { dailyReportForMineSearchParamsParsers } from '~/features/reports/daily/types/search-params/daily-report-for-mine-search-params'

export function DailySearchDateRangePicker() {
  const [{ startDate, endDate }] = useQueryStates(dailyReportForMineSearchParamsParsers)

  const defaultValue =
    startDate && endDate
      ? ({
          start: parseDate(startDate.toISOString().slice(0, 10)),
          end: parseDate(endDate.toISOString().slice(0, 10)),
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
