import { IconPlus } from '@intentui/icons'
import Link from 'next/link'
import { Button } from '~/components/ui/intent-ui/button'
import { LinkLoadingIndicator } from '~/components/ui/link-loading-indicator'
import { getWeeklyReportMissions } from '~/features/reports/weekly/server/fetcher'
import {
  getNextWeekDates,
  getYearAndWeek,
  splitDates,
} from '~/features/reports/weekly/utils/date-utils'

export async function WeeklyRegisterLink({
  dates,
  userId,
}: Record<'dates' | 'userId', string>) {
  const { startDate, endDate } = splitDates(dates)
  const { year, week } = getYearAndWeek(
    getNextWeekDates(startDate, endDate).nextStartDate,
  )

  const res = await getWeeklyReportMissions(
    {
      year: year.toString(),
      week: week.toString(),
    },
    userId,
  )

  return (
    <Link
      href={`/weekly/list/${res.weeklyReport ? res.weeklyReport.id : dates}/register`}
      prefetch={false}
      className="max-w-fit"
    >
      <Button>
        次週の予定を{res.weeklyReport ? '編集' : '追加'}
        <LinkLoadingIndicator>
          <IconPlus />
        </LinkLoadingIndicator>
      </Button>
    </Link>
  )
}
