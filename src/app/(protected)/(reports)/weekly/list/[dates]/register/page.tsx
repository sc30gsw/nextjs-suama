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
import { CreateWeeklyReportForm } from '~/features/reports/weekly/components/create-weekly-report-form'
import { weeklyInputCountSearchParamsCache } from '~/features/reports/weekly/types/search-params/weekly-input-count-search-params-cache'
import {
  getNextWeekDates,
  splitDates,
} from '~/features/reports/weekly/utils/date-utils'

import { getServerSession } from '~/lib/get-server-session'
import type { NextPageProps } from '~/types'

export default async function WeeklyReportRegisterPage({
  params,
  searchParams,
}: NextPageProps<Record<'dates', string>, SearchParams>) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const { dates } = await params
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
      <Heading level={2}>
        {nextStartDate} 〜 {nextEndDate} の予定を追加
      </Heading>
      <Suspense
        fallback={
          <>
            <Button size="square-petite" className="rounded-full mt-4">
              <IconPlus />
            </Button>
            <div className="space-y-2">
              {Array.from({ length: count > 0 ? count : 1 }).map(() => (
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
                <Heading className="text-muted-fg text-lg">0時間</Heading>
              </div>
              <Separator orientation="horizontal" />
              <div className="flex items-center justify-end gap-x-2 my-4">
                <Button>
                  登録する
                  <IconSend3 />
                </Button>
              </div>
            </div>
          </>
        }
      >
        <CreateWeeklyReportForm promises={promises} />
      </Suspense>
    </div>
  )
}
