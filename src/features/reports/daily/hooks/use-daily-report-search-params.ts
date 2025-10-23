import { useQueryStates } from 'nuqs'
import type { DailyInputCountSearchParams } from '~/features/reports/daily/types/search-params/input-count-search-params-cache'

export function useDailyReportSearchParams(
  initialDailyInputCountSearchParamsParsers: DailyInputCountSearchParams,
) {
  const [{ reportEntry, appealsAndTroublesEntry, remote, impression }, setReportEntry] =
    useQueryStates(initialDailyInputCountSearchParamsParsers, {
      history: 'push',
      shallow: false,
    })

  return {
    reportEntry,
    appealsAndTroublesEntry,
    remote,
    impression,
    setReportEntry,
  } as const
}
