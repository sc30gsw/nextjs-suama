import { IconPlus, IconSend3 } from '@intentui/icons'
import { unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Button } from '~/components/ui/intent-ui/button'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Separator } from '~/components/ui/intent-ui/separator'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { getMissions } from '~/features/report-contexts/missions/server/fetcher'
import { getProjects } from '~/features/report-contexts/projects/server/fetcher'
import { UpdateWeeklyReportForm } from '~/features/reports/weekly/components/update-weekly-report-form'
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
  const { startDate, endDate } = splitDates(dates)
  const { nextStartDate, nextEndDate } = getNextWeekDates(startDate, endDate)

  const { weeklyReportEntry } =
    await weeklyInputCountSearchParamsCache.parse(searchParams)

  const count = weeklyReportEntry.count

  const projectPromise = getProjects(undefined, session.user.id)
  const missionPromise = getMissions(undefined, session.user.id)
  const weeklyReportMissionsPromise = getWeeklyReportMissionsById(
    { weeklyReportId },
    session.user.id,
  )

  const promises = Promise.all([
    projectPromise,
    missionPromise,
    weeklyReportMissionsPromise,
  ])

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-4">
      <Heading level={2}>
        {nextStartDate} 〜 {nextEndDate} の予定を編集
      </Heading>
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
        <UpdateWeeklyReportForm promises={promises} />
      </Suspense>
    </div>
  )
}
