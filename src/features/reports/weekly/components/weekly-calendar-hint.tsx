'use client'
import { type ReactNode, useRef } from 'react'
import { useToggle } from 'react-use'
import { Button } from '~/components/ui/intent-ui/button'
import { Popover } from '~/components/ui/intent-ui/popover'
import { WeekRangeCalendar } from '~/features/reports/weekly/components/weeks-range-calendar'
import { getYearAndWeek } from '~/features/reports/weekly/utils/weekly-date-utils'

type WeeklyCalendarHintProps = {
  children: ReactNode
  label: string
  startDay: Date
  endDay: Date
}

export function WeeklyCalendarHint({ children, startDay, label, endDay }: WeeklyCalendarHintProps) {
  const { year, week } = getYearAndWeek(startDay.toISOString())

  const [isOpen, toggle] = useToggle(false)
  const triggerRef = useRef(null)

  return (
    <>
      <Button ref={triggerRef} onPress={toggle} intent="plain">
        {children}
      </Button>
      <Popover.Content
        triggerRef={triggerRef}
        isOpen={isOpen}
        onOpenChange={toggle}
        className="sm:min-w-96"
      >
        <Popover.Header>
          <Popover.Title>{label}</Popover.Title>
          <Popover.Description>
            {label}（{year}年 第{week}週の予定）
            <br />
            を確認することができます
          </Popover.Description>
        </Popover.Header>
        <Popover.Body className="justify-centera flex items-center">
          <div className="w-fit ">
            <WeekRangeCalendar startDay={startDay} endDay={endDay} />
          </div>
        </Popover.Body>
        <Popover.Footer className="mt-2">
          <Popover.Close onPress={toggle} className="w-full">
            閉じる
          </Popover.Close>
        </Popover.Footer>
      </Popover.Content>
    </>
  )
}
