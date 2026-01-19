'use client'

import { IconChevronLgLeft, IconChevronLgRight } from '@intentui/icons'
import { type CalendarDate, getLocalTimeZone, today } from '@internationalized/date'
import { useDateFormatter } from '@react-aria/i18n'
import { use } from 'react'
import type {
  CalendarProps as CalendarPrimitiveProps,
  CalendarState,
  DateValue,
  RangeCalendarProps as RangeCalendarPrimitiveProps,
} from 'react-aria-components'
import {
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader as CalendarGridHeaderPrimitive,
  CalendarHeaderCell,
  Calendar as CalendarPrimitive,
  CalendarStateContext,
  Heading,
  RangeCalendar as RangeCalendarPrimitive,
  Text,
  useLocale,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'
import { Button } from '~/components/ui/intent-ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from '~/components/ui/intent-ui/select'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { isJapaneseHoliday, isSaturday, isSunday } from '~/utils/holiday-utils'

export type JapaneseCalendarProps<T extends DateValue> = Omit<
  CalendarPrimitiveProps<T>,
  'visibleDuration'
> &
  Partial<Record<'errorMessage' | 'className', string>> & {
    onFocusChange?: (date: DateValue | false) => void
    isLoading?: boolean
  }

export function JapaneseCalendar<T extends DateValue>({
  errorMessage,
  className,
  onFocusChange,
  isLoading,
  ...props
}: JapaneseCalendarProps<T>) {
  const now = today(getLocalTimeZone())

  return (
    <CalendarPrimitive data-slot="calendar" onFocusChange={onFocusChange} {...props}>
      <JapaneseCalendarHeader />
      <CalendarGrid>
        <JapaneseCalendarGridHeader />
        <CalendarGridBody>
          {(date) => {
            const jsDate = date.toDate(getLocalTimeZone())
            const saturday = isSaturday(jsDate)
            const sunday = isSunday(jsDate)
            const holiday = isJapaneseHoliday(jsDate)

            return (
              <CalendarCell
                date={date}
                data-saturday={saturday || undefined}
                data-sunday={sunday || undefined}
                data-holiday={holiday || undefined}
                className={({ isSelected, isDisabled, date }) => {
                  const isUnavailable = props.isDateUnavailable?.(date) ?? false

                  return twMerge(
                    'relative flex size-11 cursor-default items-center justify-center rounded-lg text-fg tabular-nums outline-hidden sm:size-9 sm:text-sm/6 forced-colors:text-[ButtonText] forced-colors:outline-0',
                    !isDisabled && !isUnavailable && !isLoading && 'hover:bg-secondary-fg/15',
                    isSelected &&
                      !isLoading &&
                      'bg-primary pressed:bg-primary text-primary-fg hover:bg-primary/90 data-invalid:bg-danger data-invalid:text-danger-fg forced-colors:bg-[Highlight] forced-colors:text-[Highlight] forced-colors:data-invalid:bg-[Mark]',
                    isDisabled || isUnavailable || isLoading
                      ? 'cursor-not-allowed! bg-muted/60! text-muted-fg! opacity-60! hover:bg-muted/60! hover:text-muted-fg! forced-colors:bg-[GrayText]! forced-colors:text-[GrayText]!'
                      : '',
                    date.compare(now) === 0 &&
                      'after:-translate-x-1/2 after:pointer-events-none after:absolute after:start-1/2 after:bottom-1 after:z-10 after:size-[3px] after:rounded-full after:bg-primary selected:after:bg-primary-fg focus-visible:after:bg-primary-fg',
                    className,
                  )
                }}
              >
                {isLoading ? (
                  <Skeleton className="size-9 sm:size-7.5" />
                ) : (
                  ({ formattedDate }) => formattedDate
                )}
              </CalendarCell>
            )
          }}
        </CalendarGridBody>
      </CalendarGrid>
      {errorMessage && (
        <Text slot="errorMessage" className="text-danger text-sm/6">
          {errorMessage}
        </Text>
      )}
    </CalendarPrimitive>
  )
}

function JapaneseCalendarHeader({
  isRange,
  hideNavigationButtons,
  className,
  ...props
}: React.ComponentProps<'header'> & Partial<Record<'isRange' | 'hideNavigationButtons', boolean>>) {
  const { direction } = useLocale()
  const state = use(CalendarStateContext)!

  return (
    <header
      data-slot="calendar-header"
      className={twMerge(
        'flex w-full justify-between gap-1.5 pt-1 pr-1 pb-5 pl-1.5 sm:pb-4',
        className,
      )}
      {...props}
    >
      {!isRange && (
        <div className="flex items-center gap-1.5">
          <SelectMonth state={state} />
          <SelectYear state={state} />
        </div>
      )}
      <Heading
        className={twMerge(
          'mr-2 flex-1 text-left font-medium text-muted-fg sm:text-sm',
          !isRange && 'sr-only',
          className,
        )}
      />
      {!hideNavigationButtons && (
        <div className="flex items-center gap-1">
          <Button
            size="sq-sm"
            className="size-8 **:data-[slot=icon]:text-fg sm:size-7"
            isCircle
            intent="plain"
            slot="previous"
          >
            {direction === 'rtl' ? <IconChevronLgRight /> : <IconChevronLgLeft />}
          </Button>
          <Button
            size="sq-sm"
            className="size-8 **:data-[slot=icon]:text-fg sm:size-7"
            isCircle
            intent="plain"
            slot="next"
          >
            {direction === 'rtl' ? <IconChevronLgLeft /> : <IconChevronLgRight />}
          </Button>
        </div>
      )}
    </header>
  )
}

const INITIAL_MONTH = 1
function SelectMonth({ state }: Record<'state', CalendarState>) {
  const months: string[] = []

  const formatter = useDateFormatter({
    month: 'long',
    timeZone: state.timeZone,
  })

  const numMonths = state.focusedDate.calendar.getMonthsInYear(state.focusedDate)

  for (let i = INITIAL_MONTH; i <= numMonths; i++) {
    const date = state.focusedDate.set({ month: i })
    months.push(formatter.format(date.toDate(state.timeZone)))
  }

  return (
    <Select
      className="[popover-width:8rem]"
      aria-label="Select month"
      selectedKey={state.focusedDate.month.toString() ?? (new Date().getMonth() + 1).toString()}
      onSelectionChange={(value) => {
        state.setFocusedDate(state.focusedDate.set({ month: Number(value) }))
      }}
    >
      <SelectTrigger className="w-22 text-sm/5 **:data-[slot=select-value]:inline-block **:data-[slot=select-value]:truncate sm:px-2.5 sm:py-1.5 sm:*:text-sm/5" />
      <SelectContent className="min-w-0">
        {months.map((month, index) => (
          <SelectItem key={index} id={(index + 1).toString()} textValue={month}>
            <SelectLabel>{month}</SelectLabel>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const INITIAL_YEAR = 20

function SelectYear({ state }: Record<'state', CalendarState>) {
  const years: { value: CalendarDate; formatted: string }[] = []

  const formatter = useDateFormatter({
    year: 'numeric',
    timeZone: state.timeZone,
  })

  for (let i = -INITIAL_YEAR; i <= INITIAL_YEAR; i++) {
    const date = state.focusedDate.add({ years: i })

    years.push({
      value: date,
      formatted: formatter.format(date.toDate(state.timeZone)),
    })
  }

  return (
    <Select
      aria-label="Select year"
      selectedKey={INITIAL_YEAR}
      onSelectionChange={(value) => {
        state.setFocusedDate(years[Number(value)]?.value as CalendarDate)
      }}
    >
      <SelectTrigger className="text-sm/5 sm:px-2.5 sm:py-1.5 sm:*:text-sm/5" />
      <SelectContent>
        {years.map((year, i) => (
          <SelectItem key={i} id={i} textValue={year.formatted}>
            <SelectLabel>{year.formatted}</SelectLabel>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const WEEK_DAYS = ['日', '月', '火', '水', '木', '金', '土'] as const satisfies readonly string[]
type WeekDay = (typeof WEEK_DAYS)[number]

function JapaneseCalendarGridHeader() {
  return (
    <CalendarGridHeaderPrimitive>
      {(day) => {
        const dayIndex = WEEK_DAYS.indexOf(day as WeekDay)
        const isSat = dayIndex === 6
        const isSun = dayIndex === 0

        return (
          <CalendarHeaderCell
            data-slot="calendar-header-cell"
            data-saturday={isSat || undefined}
            data-sunday={isSun || undefined}
            className="pb-2 text-center font-semibold text-muted-fg text-sm/6 sm:px-0 sm:py-0.5 lg:text-xs"
          >
            {day}
          </CalendarHeaderCell>
        )
      }}
    </CalendarGridHeaderPrimitive>
  )
}

type JapaneseRangeCalendarProps<T extends DateValue> = RangeCalendarPrimitiveProps<T> &
  Partial<Record<'errorMessage', string>> & {
    onCellClick?: (date: Date) => void
    hideNavigationButtons?: boolean
  }

export function JapaneseRangeCalendar<T extends DateValue>({
  errorMessage,
  className: _className,
  visibleDuration = { months: 1 },
  onCellClick,
  hideNavigationButtons,
  ...props
}: JapaneseRangeCalendarProps<T>) {
  const now = today(getLocalTimeZone())

  return (
    <RangeCalendarPrimitive visibleDuration={visibleDuration} {...props}>
      <JapaneseCalendarHeader isRange={true} hideNavigationButtons={hideNavigationButtons} />
      <div className="flex snap-x items-start justify-stretch gap-6 overflow-auto sm:gap-10">
        {Array.from({ length: visibleDuration?.months ?? 1 }).map((_, index) => {
          const id = index + 1
          return (
            <CalendarGrid
              key={index}
              offset={id >= 2 ? { months: id - 1 } : undefined}
              className="[&_td]:border-collapse [&_td]:px-0 [&_td]:py-0.5"
            >
              <JapaneseCalendarGridHeader />
              <CalendarGridBody className="snap-start">
                {(date) => {
                  const jsDate = date.toDate(getLocalTimeZone())
                  const saturday = isSaturday(jsDate)
                  const sunday = isSunday(jsDate)
                  const holiday = isJapaneseHoliday(jsDate)

                  const handleCellClick = () => {
                    if (onCellClick) {
                      onCellClick(jsDate)
                    }
                  }

                  return (
                    <CalendarCell
                      date={date}
                      data-saturday={saturday || undefined}
                      data-sunday={sunday || undefined}
                      data-holiday={holiday || undefined}
                      onPointerUp={handleCellClick}
                      className={twMerge([
                        'shrink-0 [--cell-fg:var(--color-primary)] [--cell:color-mix(in_oklab,var(--color-primary)_15%,white_85%)]',
                        'dark:[--cell-fg:color-mix(in_oklab,var(--color-primary)_80%,white_20%)] dark:[--cell:color-mix(in_oklab,var(--color-primary)_30%,black_45%)]',
                        'group/calendar-cell relative size-10 cursor-default outside-month:text-muted-fg leading-[2.286rem] outline-hidden selection-start:rounded-s-lg selection-end:rounded-e-lg sm:size-9 sm:text-sm',
                        'selected:bg-(--cell)/70 selected:text-(--cell-fg) dark:selected:bg-(--cell)',
                        'selected:after:bg-primary-fg invalid:selected:bg-danger/10 focus-visible:after:bg-primary-fg dark:invalid:selected:bg-danger/13',
                        '[td:first-child_&]:rounded-s-lg [td:last-child_&]:rounded-e-lg',
                        'forced-colors:selected:bg-[Highlight] forced-colors:selected:text-[HighlightText] forced-colors:invalid:selected:bg-[Mark]',
                        date.compare(now) === 0 &&
                          'after:-translate-x-1/2 after:pointer-events-none after:absolute after:start-1/2 after:bottom-1 after:z-10 after:size-[3px] after:rounded-full after:bg-primary selected:after:bg-primary-fg',
                      ])}
                    >
                      {({
                        formattedDate,
                        isSelected,
                        isSelectionStart,
                        isSelectionEnd,
                        isDisabled,
                      }) => (
                        <span
                          className={twMerge(
                            'flex size-full items-center justify-center rounded-lg tabular-nums forced-color-adjust-none',
                            isSelected && (isSelectionStart || isSelectionEnd)
                              ? 'bg-primary text-primary-fg group-invalid/calendar-cell:bg-danger group-invalid/calendar-cell:text-danger-fg forced-colors:bg-[Highlight] forced-colors:text-[HighlightText] forced-colors:group-invalid/calendar-cell:bg-[Mark]'
                              : isSelected
                                ? [
                                    'group-hover/calendar-cell:bg-primary/15 dark:group-hover/calendar-cell:bg-primary/20 forced-colors:group-hover/calendar-cell:bg-[Highlight]',
                                    'group-pressed/calendar-cell:bg-(--cell) forced-colors:text-[HighlightText] forced-colors:group-pressed/calendar-cell:bg-[Highlight]',
                                    'group-invalid/calendar-cell:group-hover/calendar-cell:bg-danger/20 group-invalid/calendar-cell:group-pressed/calendar-cell:bg-danger/30 forced-colors:group-invalid/calendar-cell:group-pressed/calendar-cell:bg-[Mark]',
                                    'group-invalid/calendar-cell:text-danger forced-colors:group-invalid:group-hover/calendar-cell:bg-[Mark]',
                                  ]
                                : 'group-hover/calendar-cell:bg-secondary-fg/15 group-pressed/calendar-cell:bg-secondary-fg/20 forced-colors:group-pressed/calendar-cell:bg-[Highlight]',
                            isDisabled && 'opacity-50 forced-colors:text-[GrayText]',
                          )}
                        >
                          {formattedDate}
                        </span>
                      )}
                    </CalendarCell>
                  )
                }}
              </CalendarGridBody>
            </CalendarGrid>
          )
        })}
      </div>
      {errorMessage && (
        <Text slot="errorMessage" className="text-danger text-sm">
          {errorMessage}
        </Text>
      )}
    </RangeCalendarPrimitive>
  )
}
