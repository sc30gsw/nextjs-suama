import type { Session } from 'better-auth'
import { addDays, format, getMonth, getYear } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import type { InferRequestType } from 'hono'
import { useMemo, useState } from 'react'
import type { DateValue } from 'react-aria-components'
import { APP_TIMEZONE } from '~/constants/date'
import { fetchDailyReportDatesQuery } from '~/features/reports/daily/queries/fetcher'
import type { client } from '~/lib/rpc'
import { DATE_FORMAT, dateUtils } from '~/utils/date-utils'

const MAX_DAYS = 30

type UseDisabledDatesOptions = {
  userId: Session['userId']
  excludeReportId?: InferRequestType<
    typeof client.api.dailies.dates.$get
  >['query']['excludeReportId']
}

export function useDisabledDates({ userId, excludeReportId }: UseDisabledDatesOptions) {
  const nowInJst = toZonedTime(new Date(), APP_TIMEZONE)

  const [focusedYear, setFocusedYear] = useState(getYear(nowInJst))
  const [focusedMonth, setFocusedMonth] = useState(getMonth(nowInJst) + 1)

  const queryParams = useMemo(
    () => ({
      query: {
        year: focusedYear.toString(),
        month: focusedMonth.toString(),
        excludeReportId,
      },
    }),
    [focusedYear, focusedMonth, excludeReportId],
  )

  const { data, isLoading } = fetchDailyReportDatesQuery(queryParams, userId).use()

  // ? TanStack Queryのfetchが安定しないため、useMemoでメモ化する
  const disabledDatesSet = useMemo(
    () => (!data?.dates ? new Set<string>() : new Set(data.dates)),
    [data?.dates],
  )

  // ? TanStack Queryのfetchが安定しないため、useMemoでメモ化する
  const isDateUnavailable = useMemo(
    () => (date: DateValue) => {
      const dateStr = format(new Date(date.year, date.month - 1, date.day), DATE_FORMAT)
      return disabledDatesSet.has(dateStr)
    },
    [disabledDatesSet],
  )

  const handleFocusChange = (year: number, month: number) => {
    setFocusedYear(year)
    setFocusedMonth(month)
  }

  const defaultReportDate = useMemo(() => {
    const today = new Date()
    const todayDateStr = dateUtils.formatDateByJST(today)

    if (!data?.dates) {
      return todayDateStr
    }

    const registeredDatesSet = new Set(data.dates)
    const hasTodayReport = registeredDatesSet.has(todayDateStr)

    if (!hasTodayReport) {
      return todayDateStr
    }

    let checkDate = today
    let foundDate = null

    for (let i = 0; i < MAX_DAYS; i++) {
      checkDate = addDays(checkDate, 1)
      const checkDateStr = dateUtils.formatDateByJST(checkDate)

      if (!registeredDatesSet.has(checkDateStr)) {
        foundDate = checkDateStr
        break
      }
    }

    return foundDate ?? todayDateStr
  }, [data?.dates])

  return {
    isDateUnavailable,
    isLoading,
    handleFocusChange,
    focusedYear,
    focusedMonth,
    defaultReportDate,
  } as const
}
