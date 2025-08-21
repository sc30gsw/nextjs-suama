import { useQueryStates } from 'nuqs'
import type {
  UpdateWeeklyInputCountSearchParams,
  WeeklyInputCountSearchParams,
} from '~/features/reports/weekly/types/search-params/weekly-input-count-search-params-cache'

export function useWeeklyReportSearchParams(
  initialWeeklyInputCountSearchParamsParsers:
    | WeeklyInputCountSearchParams
    | UpdateWeeklyInputCountSearchParams,
) {
  const [{ weeklyReportEntry }, setWeeklyReportEntry] = useQueryStates(
    initialWeeklyInputCountSearchParamsParsers,
    {
      history: 'push',
      shallow: false,
    },
  )

  return {
    weeklyReportEntry,
    setWeeklyReportEntry,
  } as const
}
