import {
  IconPlus,
  IconSearchSketchbook,
  IconSend3,
  IconTriangleExclamation,
} from '@intentui/icons'
import Form from 'next/form'
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
import { DisConnectLastWeekReportsButton } from '~/features/reports/weekly/components/dis-connect-last-week-reports-button'
import { getLastWeeklyReportMissions } from '~/features/reports/weekly/server/fetcher'
import { weeklyInputCountSearchParamsCache } from '~/features/reports/weekly/types/search-params/weekly-input-count-search-params-cache'
import {
  getNextWeekDates,
  getYearAndWeek,
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

  const { weeklyReportEntry, isReference } =
    await weeklyInputCountSearchParamsCache.parse(searchParams)

  let lastWeeklyReportMission:
    | Awaited<ReturnType<typeof getLastWeeklyReportMissions>>
    | undefined

  if (isReference) {
    const { year, week } = getYearAndWeek(startDate)

    lastWeeklyReportMission = await getLastWeeklyReportMissions(
      { year: year.toString(), week: week.toString() },
      session.user.id,
    )
  }

  const count = weeklyReportEntry.count

  const projectPromise = getProjects(undefined, session.user.id)
  const missionPromise = getMissions(undefined, session.user.id)

  const promises = Promise.all([projectPromise, missionPromise])

  const isReferenceWithoutReport =
    isReference && !lastWeeklyReportMission?.weeklyReport

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-4">
      <Heading level={2}>
        {nextStartDate} 〜 {nextEndDate} の予定を追加
      </Heading>
      {isReferenceWithoutReport || !isReference ? (
        <Form action={`/weekly/list/${dates}/register`}>
          <input type="hidden" name="isReference" value="true" />
          <Button type="submit">
            前週の予定 を参照する
            <IconSearchSketchbook />
          </Button>
        </Form>
      ) : (
        <DisConnectLastWeekReportsButton />
      )}

      {isReferenceWithoutReport ? (
        <div className="bg-danger/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-danger">
          <IconTriangleExclamation className="size-4" />
          <p>前週の予定が見つかりませんでした。</p>
        </div>
      ) : null}
      <Suspense
        key={JSON.stringify(isReference)}
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
        <CreateWeeklyReportForm
          promises={promises}
          lastWeeklyReportMissions={lastWeeklyReportMission}
        />
      </Suspense>
    </div>
  )
}
