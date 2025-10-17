'use client'

import { type CalendarDate, parseDate } from '@internationalized/date'
import { format } from 'date-fns'
import { useQueryStates } from 'nuqs'
import { DateRangePicker } from '~/components/ui/intent-ui/date-range-picker'

import { DATE_FORMAT } from '~/utils/date-utils'
import { dailyReportForMineSearchParamsParsers } from '../../mine/types/search-params/daily-report-for-mine-search-params'

export function DailySearchDateRangePicker() {
  const [{ startDate, endDate }] = useQueryStates(dailyReportForMineSearchParamsParsers)

  const defaultValue =
    startDate && endDate
      ? ({
          start: parseDate(format(startDate, DATE_FORMAT)),
          end: parseDate(format(endDate, DATE_FORMAT)),
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
