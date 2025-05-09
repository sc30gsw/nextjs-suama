'use client'

import type {
  CalendarDate,
  CalendarDateTime,
  ZonedDateTime,
} from '@internationalized/date'
import { RangeCalendar } from '~/components/ui/intent-ui/range-calendar'

type WeekRangeCalendarProps = Record<
  'start' | 'end',
  CalendarDate | CalendarDateTime | ZonedDateTime
>

export function WeekRangeCalendar({ start, end }: WeekRangeCalendarProps) {
  return (
    <RangeCalendar
      className="**:data-[slot=calendar-header]:items-center"
      aria-label="Date range"
      defaultValue={{
        start,
        end,
      }}
      isReadOnly={true}
      isHeadingHidden={true}
      isDirectionHidden={true}
    />
  )
}
