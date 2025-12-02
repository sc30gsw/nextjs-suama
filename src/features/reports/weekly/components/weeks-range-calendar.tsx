'use client'

import { fromDate, getLocalTimeZone } from '@internationalized/date'
import { JapaneseRangeCalendar } from '~/components/ui/japanese-calendar'

type WeekRangeCalendarProps = Record<'startDay' | 'endDay', Date> & {
  onSelectDate?: (date: Date) => void
}

export function WeekRangeCalendar({ startDay, endDay, onSelectDate }: WeekRangeCalendarProps) {
  return (
    <JapaneseRangeCalendar
      className="**:data-[slot=calendar-header]:items-center"
      aria-label="Date range"
      defaultValue={{
        start: fromDate(startDay, getLocalTimeZone()),
        end: fromDate(endDay, getLocalTimeZone()),
      }}
      isReadOnly={true}
      onCellClick={onSelectDate}
    />
  )
}
