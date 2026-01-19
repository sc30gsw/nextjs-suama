import { IconPlus, IconSearchSketchbook, IconSend3, IconTriangleExclamation } from '@intentui/icons'
import Form from 'next/form'
import { redirect, unauthorized } from 'next/navigation'
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
import { WeeklyCalendarHint } from '~/features/reports/weekly/components/weekly-calendar-hint'
import {
  getLastWeeklyReportMissions,
  getWeeklyReportMissions,
} from '~/features/reports/weekly/server/fetcher'
import { weeklyInputCountSearchParamsCache } from '~/features/reports/weekly/types/search-params/weekly-input-count-search-params-cache'
import {
  getNextWeekDates,
  getYearAndWeek,
  splitDates,
} from '~/features/reports/weekly/utils/weekly-date-utils'
import { getServerSession } from '~/lib/get-server-session'
import { urls } from '~/lib/urls'
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
  const { year, week } = getYearAndWeek(nextStartDate)

  const res = await getWeeklyReportMissions(
    { year: year.toString(), week: week.toString() },
    session.user.id,
  )

  if (res?.weeklyReport) {
    redirect(
      urls.build({
        route: '/weekly/list/[dates]/edit/[weeklyReportId]',
        params: { dates, weeklyReportId: res.weeklyReport.id },
      }).href,
    )
  }

  const { weeklyReportEntry, isReference } =
    await weeklyInputCountSearchParamsCache.parse(searchParams)

  let lastWeeklyReportMission: Awaited<ReturnType<typeof getLastWeeklyReportMissions>> | undefined

  if (isReference) {
    lastWeeklyReportMission = await getLastWeeklyReportMissions(
      { year: year.toString(), week: week.toString() },
      session.user.id,
    )
  }

  const count = weeklyReportEntry.count

  const projectPromise = getProjects(session.user.id, { archiveStatus: 'active' })
  const missionPromise = getMissions(session.user.id, { archiveStatus: 'active' })

  const promises = Promise.all([projectPromise, missionPromise])

  const isReferenceWithoutReport = isReference && !lastWeeklyReportMission?.weeklyReport

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      <div className="flex flex-col">
        <div className="flex items-center">
          <WeeklyCalendarHint
            label="追加する予定の期間"
            startDay={new Date(nextStartDate)}
            endDay={new Date(nextEndDate)}
          >
            <Heading level={2} className="cursor-pointer underline">
              {nextStartDate} 〜 {nextEndDate}
            </Heading>
          </WeeklyCalendarHint>
          <Heading level={2}>の予定を追加</Heading>
        </div>
        <p className="ml-4 text-muted-fg text-sm">
          ※ 日付をクリックすると、予定のカレンダーが表示されます。
        </p>
      </div>
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
        <div className="flex items-center gap-x-2 rounded-md bg-danger/15 p-3 text-danger text-sm">
          <IconTriangleExclamation className="size-4" />
          <p>前週の予定が見つかりませんでした。</p>
        </div>
      ) : null}
      <Suspense
        key={JSON.stringify(isReference)}
        fallback={
          <>
            <Button size="sq-sm" className="mt-4 rounded-full">
              <IconPlus />
            </Button>
            <div className="space-y-2">
              {Array.from({ length: count > 0 ? count : 1 }).map(() => (
                <div
                  key={crypto.randomUUID()}
                  className="mx-auto grid grid-cols-11 grid-rows-1 items-center gap-4 py-2"
                >
                  <Skeleton className="col-span-2 h-7" />
                  <Skeleton className="col-span-2 h-7" />
                  <Skeleton className="col-span-2 h-7" />
                  <Skeleton className="col-span-4 h-7" />
                  <Skeleton className="col-span-1 size-9 rounded-full" />
                </div>
              ))}

              <Separator orientation="horizontal" />
              <div className="my-4 flex items-center gap-x-2">
                <span className="text-sm">合計時間:</span>
                <Heading className="text-lg text-muted-fg">0時間</Heading>
              </div>
              <Separator orientation="horizontal" />
              <div className="my-4 flex items-center justify-end gap-x-2">
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
          date={{ dates, year, week }}
        />
      </Suspense>
    </div>
  )
}
