'use client'

import { fromDate, getLocalTimeZone } from '@internationalized/date'
import { RangeCalendar } from '~/components/ui/intent-ui/range-calendar'

type WeekRangeCalendarProps = {
  week: {
    weekNumber: number
    startDay: Date
    endDay: Date
  }
}

export function WeekRangeCalendar({ week }: WeekRangeCalendarProps) {
  return (
    <RangeCalendar
      className="**:data-[slot=calendar-header]:items-center"
      aria-label="Date range"
      defaultValue={{
        start: fromDate(week.startDay, getLocalTimeZone()),
        end: fromDate(week.endDay, getLocalTimeZone()),
      }}
      isReadOnly={true}
      isHeadingHidden={true}
      isDirectionHidden={true}
    />
  )
}
