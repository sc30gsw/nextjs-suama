'use client'

import { DateRangePicker } from '~/components/ui/intent-ui/date-range-picker'

export function DailySearchDateRangePicker() {
  return (
    <DateRangePicker
      startName="startDate"
      endName="endDate"
      className="w-full max-w-64"
    />
  )
}
