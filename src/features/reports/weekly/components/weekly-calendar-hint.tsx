'use client'
import type { ReactNode } from 'react'
import { Button } from '~/components/ui/intent-ui/button'
import { Popover } from '~/components/ui/intent-ui/popover'
import { WeekRangeCalendar } from '~/features/reports/weekly/components/weeks-range-calendar'

type WeeklyCalendarHintProps = {
  children: ReactNode
  label: string
  startDay: Date
  endDay: Date
}

export function WeeklyCalendarHint({
  children,
  startDay,
  label,
  endDay,
}: WeeklyCalendarHintProps) {
  return (
    <Popover>
      <Button intent="plain">{children}</Button>
      <Popover.Content className="sm:min-w-96">
        <Popover.Header>
          <Popover.Title>{label}</Popover.Title>
          <Popover.Description>
            {label}を確認することができます
          </Popover.Description>
        </Popover.Header>
        <Popover.Body className="flex items-center justify-centera">
          <div className="w-fit ">
            <WeekRangeCalendar startDay={startDay} endDay={endDay} />
          </div>
        </Popover.Body>
        <Popover.Footer className="mt-2">
          <Popover.Close className="w-full">閉じる</Popover.Close>
        </Popover.Footer>
      </Popover.Content>
    </Popover>
  )
}
