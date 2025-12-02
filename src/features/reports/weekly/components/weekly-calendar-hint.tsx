'use client'
import { useRouter } from 'next/navigation'
import { type ReactNode, useRef } from 'react'
import { useToggle } from 'react-use'
import { Button } from '~/components/ui/intent-ui/button'
import { Popover } from '~/components/ui/intent-ui/popover'
import { WeekRangeCalendar } from '~/features/reports/weekly/components/weeks-range-calendar'
import {
  getWeekRangeFromDate,
  getYearAndWeek,
} from '~/features/reports/weekly/utils/weekly-date-utils'
import { urls } from '~/lib/urls'

type WeeklyCalendarHintProps = {
  children: ReactNode
  label: string
  startDay: Date
  endDay: Date
}

export function WeeklyCalendarHint({ children, startDay, label, endDay }: WeeklyCalendarHintProps) {
  const { year, week } = getYearAndWeek(startDay.toISOString())
  const router = useRouter()

  const [isOpen, toggle] = useToggle(false)
  const triggerRef = useRef(null)

  const handleSelectDate = (selectedDate: Date) => {
    const { startDate, endDate } = getWeekRangeFromDate(selectedDate)

    const href = urls.build({
      route: '/weekly/list/[dates]',
      params: {
        dates: `${startDate}-${endDate}`,
      },
    }).href

    toggle(false)

    router.push(href)
  }

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
            {year}年 第{week}週の予定を確認できます
            <br />
            日付をクリックするとその週の予定一覧に移動します
          </Popover.Description>
        </Popover.Header>
        <Popover.Body className="flex items-center justify-center">
          <div className="w-fit">
            <WeekRangeCalendar
              startDay={startDay}
              endDay={endDay}
              onSelectDate={handleSelectDate}
            />
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
