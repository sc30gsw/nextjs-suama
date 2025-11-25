'use client'

import { type CalendarDate, parseDate } from '@internationalized/date'
import { format } from 'date-fns'
import { useQueryStates } from 'nuqs'
import { JapaneseDateRangePicker } from '~/components/ui/japanese-date-picker'
import { dailyReportSearchParamsParsers } from '~/features/reports/daily/types/search-params/daily-report-search-params'
import { DATE_FORMAT } from '~/utils/date-utils'

export function DailyReportsSearchDateRangePicker() {
  const [{ startDate, endDate }] = useQueryStates(dailyReportSearchParamsParsers)

  const defaultValue =
    startDate && endDate
      ? ({
          start: parseDate(format(startDate, DATE_FORMAT)),
          end: parseDate(format(endDate, DATE_FORMAT)),
        } as const satisfies Record<string, CalendarDate>)
      : undefined

  return (
    <JapaneseDateRangePicker
      defaultValue={defaultValue}
      startName="startDate"
      endName="endDate"
      className="w-full max-w-64"
    />
  )
}
