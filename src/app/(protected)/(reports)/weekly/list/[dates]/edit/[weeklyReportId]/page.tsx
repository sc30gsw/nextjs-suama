import { IconPlus, IconSend3 } from '@intentui/icons'
import { forbidden, notFound, unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Button } from '~/components/ui/intent-ui/button'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Separator } from '~/components/ui/intent-ui/separator'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { getMissions } from '~/features/report-contexts/missions/server/fetcher'
import { getProjects } from '~/features/report-contexts/projects/server/fetcher'
import { UpdateWeeklyReportForm } from '~/features/reports/weekly/components/update-weekly-report-form'
import { WeeklyCalendarHint } from '~/features/reports/weekly/components/weekly-calendar-hint'
import { getWeeklyReportMissionsById } from '~/features/reports/weekly/server/fetcher'
import { weeklyInputCountSearchParamsCache } from '~/features/reports/weekly/types/search-params/weekly-input-count-search-params-cache'
import {
  getNextWeekDates,
  splitDates,
} from '~/features/reports/weekly/utils/date-utils'
import { getServerSession } from '~/lib/get-server-session'
import type { NextPageProps } from '~/types'

export default async function WeeklyReportIdPage({
  params,
  searchParams,
}: NextPageProps<Record<'dates' | 'weeklyReportId', string>, SearchParams>) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const { dates, weeklyReportId } = await params

  const res = await getWeeklyReportMissionsById(
    { weeklyReportId },
    session.user.id,
  )

  if (!res.weeklyReport) {
    notFound()
  }

  if (res.weeklyReport.userId !== session.user.id) {
    forbidden()
  }

  const { startDate, endDate } = splitDates(dates)
  const { nextStartDate, nextEndDate } = getNextWeekDates(startDate, endDate)

  const { weeklyReportEntry } =
    await weeklyInputCountSearchParamsCache.parse(searchParams)

  const count = weeklyReportEntry.count

  const projectPromise = getProjects(undefined, session.user.id)
  const missionPromise = getMissions(undefined, session.user.id)

  const promises = Promise.all([projectPromise, missionPromise])

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex items-center">
          <WeeklyCalendarHint
            label="編集する予定の期間"
            startDay={new Date(nextStartDate)}
            endDay={new Date(nextEndDate)}
          >
            <Heading level={2} className="underline cursor-pointer">
              {nextStartDate} 〜 {nextEndDate}
            </Heading>
          </WeeklyCalendarHint>
          <Heading level={2}>の予定を編集</Heading>
        </div>
        <p className="ml-4 text-sm text-muted-fg">
          ※ 日付をクリックすると、予定のカレンダーが表示されます。
        </p>
      </div>
      <Suspense
        fallback={
          <>
            <Button size="square-petite" className="rounded-full mt-4">
              <IconPlus />
            </Button>
            <div className="space-y-2">
              {Array.from({ length: count > 0 ? count : 5 }).map(() => (
                <div
                  key={crypto.randomUUID()}
                  className="grid grid-cols-11 grid-rows-1 items-center gap-4 mx-auto py-2"
                >
                  <Skeleton className="col-span-2 h-7" />
                  <Skeleton className="col-span-2 h-7" />
                  <Skeleton className="col-span-2 h-7" />
                  <Skeleton className="col-span-4 h-7" />
                  <Skeleton className="col-span-1 size-9 rounded-full" />
                </div>
              ))}

              <Separator orientation="horizontal" />
              <div className="flex items-center gap-x-2 my-4">
                <span className="text-sm">合計時間:</span>
                <Heading className="text-muted-fg text-lg flex items-center gap-x-2">
                  <Skeleton className="h-8 w-13" />
                  時間
                </Heading>
              </div>
              <Separator orientation="horizontal" />
              <div className="flex items-center justify-end gap-x-2 my-4">
                <Button>
                  更新する
                  <IconSend3 />
                </Button>
              </div>
            </div>
          </>
        }
      >
        <UpdateWeeklyReportForm
          promises={promises}
          weeklyReport={res.weeklyReport}
        />
      </Suspense>
    </div>
  )
}
