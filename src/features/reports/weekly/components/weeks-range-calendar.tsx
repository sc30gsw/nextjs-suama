'use client'

import { fromDate, getLocalTimeZone } from '@internationalized/date'
import { RangeCalendar } from '~/components/ui/intent-ui/range-calendar'

type WeekRangeCalendarProps = Record<'startDay' | 'endDay', Date>

export function WeekRangeCalendar({ startDay, endDay }: WeekRangeCalendarProps) {
  return (
    <RangeCalendar
      className="**:data-[slot=calendar-header]:items-center"
      aria-label="Date range"
      defaultValue={{
        start: fromDate(startDay, getLocalTimeZone()),
        end: fromDate(endDay, getLocalTimeZone()),
      }}
      isReadOnly={true}
    />
  )
}
