import { IconPlus } from '@intentui/icons'
import Link from 'next/link'
import { forbidden } from 'next/navigation'
import { Button } from '~/components/ui/intent-ui/button'
import { LinkLoadingIndicator } from '~/components/ui/link-loading-indicator'
import { getWeeklyReportMissions } from '~/features/reports/weekly/server/fetcher'
import {
  getNextWeekDates,
  getYearAndWeek,
  splitDates,
} from '~/features/reports/weekly/utils/weekly-date-utils'
import { urls } from '~/lib/urls'

export async function WeeklyRegisterLink({ dates, userId }: Record<'dates' | 'userId', string>) {
  const { startDate, endDate } = splitDates(dates)
  const { year, week } = getYearAndWeek(getNextWeekDates(startDate, endDate).nextStartDate)

  const res = await getWeeklyReportMissions(
    {
      year: year.toString(),
      week: week.toString(),
    },
    userId,
  )

  if (res.weeklyReport && res.weeklyReport.userId !== userId) {
    forbidden()
  }

  const href = res.weeklyReport
    ? urls.build({
        route: '/weekly/list/[dates]/edit/[weeklyReportId]',
        params: {
          dates,
          weeklyReportId: res.weeklyReport.id,
        },
      }).href
    : urls.build({
        route: '/weekly/list/[dates]/register',
        params: {
          dates,
        },
      }).href

  return (
    <Link href={href} prefetch={false} className="max-w-fit">
      <Button>
        次週の予定を{res.weeklyReport ? '編集' : '追加'}
        <LinkLoadingIndicator>
          <IconPlus />
        </LinkLoadingIndicator>
      </Button>
    </Link>
  )
}
