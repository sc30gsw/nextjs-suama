'use client'

import { usePathname, useRouter } from 'next/navigation'
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
  const pathname = usePathname()

  const [isOpen, toggle] = useToggle(false)
  const triggerRef = useRef(null)

  const isRegister = pathname.includes('/register')
  const isEdit = pathname.includes('/edit/')

  const handleSelectDate = (selectedDate: Date) => {
    const { startDate, endDate } = getWeekRangeFromDate(selectedDate)
    const newDates = `${startDate}-${endDate}`

    // ? 登録・編集画面にも遷移させることは可能だが、選択した日の次の週がRange表示され、違和感がある
    // ? また週報登録で、既存データがある週に飛んだ場合の読み込みが時間がかかるため、一律で予定一覧に遷移することにしている
    const href = urls.build({
      route: '/weekly/list/[dates]',
      params: { dates: newDates },
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
            {(isRegister || isEdit) && (
              <>
                <br />
                <span className="text-danger text-sm">
                  ※現在の編集中の内容は保存されず、一覧に戻ります
                </span>
              </>
            )}
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
