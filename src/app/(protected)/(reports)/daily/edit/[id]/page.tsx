import { IconPlus } from '@intentui/icons'
import Link from 'next/link'
import { unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Button } from '~/components/ui/intent-ui/button'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { getAppealCategories } from '~/features/report-contexts/appeals/server/fetcher'
import { getMissions } from '~/features/report-contexts/missions/server/fetcher'
import { getProjects } from '~/features/report-contexts/projects/server/fetcher'
import {
  getTroubleCategories,
  getTroubles,
} from '~/features/report-contexts/troubles/server/fetcher'
import { EditDailyForm } from '~/features/reports/daily/components/edit-daily-form'
import { ReportAppealAndTroubleInputEntries } from '~/features/reports/daily/components/report-appeal-and-troubles-input-entries'
import { getReportById } from '~/features/reports/daily/server/fetcher'
import type {
  AppealCategoriesResponse,
  TroubleCategoriesResponse,
} from '~/features/reports/daily/types/api-response'
import { getServerSession } from '~/lib/get-server-session'
import type { NextPageProps } from '~/types'

export default async function EditDailyReportPage({
  params,
}: NextPageProps<Record<'id', string>, SearchParams>) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const reportId = (await params).id

  const [reportData, unResolvedTroubles] = await Promise.all([
    getReportById(reportId, session.user.id),
    getTroubles(session.user.id),
  ])

  const projectPromise = getProjects(undefined, session.user.id)
  const missionPromise = getMissions(undefined, session.user.id)

  const promises = Promise.all([projectPromise, missionPromise])

  return (
    <div className="flex flex-col gap-y-2 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <Heading>日報編集</Heading>
        <Link href="/daily/mine">
          <Button intent="outline">一覧に戻る</Button>
        </Link>
      </div>
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        }
      >
        <EditDailyForm
          reportData={reportData}
          promises={promises}
          troubleHeadings={
            <div className="mt-4 flex items-center">
              <Heading level={3}>困っていること</Heading>
            </div>
          }
          troubles={
            <Suspense
              fallback={
                <>
                  <Button size="square-petite" className="mt-4 rounded-full">
                    <IconPlus />
                  </Button>
                  {Array.from({ length: 3 }).map(() => (
                    <div
                      key={crypto.randomUUID()}
                      className="mx-auto grid grid-cols-12 grid-rows-1 items-center gap-4 py-2"
                    >
                      <Skeleton className="col-span-3 h-16" />
                      <Skeleton className="col-span-2 h-7" />
                      <Skeleton className="col-span-1 h-7" />
                      <Skeleton className="col-span-1 size-9 rounded-full" />
                    </div>
                  ))}
                </>
              }
            >
              {getTroubleCategories(undefined, session.user.id).then((res) => (
                <ReportAppealAndTroubleInputEntries<TroubleCategoriesResponse['troubleCategories']>
                  items={res.troubleCategories}
                  unResolvedTroubles={unResolvedTroubles}
                  kind="trouble"
                />
              ))}
            </Suspense>
          }
          appealHeadings={
            <div className="mt-4 flex items-center">
              <Heading level={3}>アピールポイント</Heading>
            </div>
          }
          appeals={
            <Suspense
              fallback={
                <>
                  <Button size="square-petite" className="mt-4 rounded-full">
                    <IconPlus />
                  </Button>
                  {Array.from({ length: 3 }).map(() => (
                    <div
                      key={crypto.randomUUID()}
                      className="mx-auto grid grid-cols-12 grid-rows-1 items-center gap-4 py-2"
                    >
                      <Skeleton className="col-span-3 h-16" />
                      <Skeleton className="col-span-2 h-7" />
                      <Skeleton className="col-span-1 h-7" />
                      <Skeleton className="col-span-1 size-9 rounded-full" />
                    </div>
                  ))}
                </>
              }
            >
              {getAppealCategories(undefined, session.user.id).then((res) => (
                <ReportAppealAndTroubleInputEntries<AppealCategoriesResponse['appealCategories']>
                  items={res.appealCategories}
                  kind="appeal"
                  existingAppeals={reportData.appealEntries}
                />
              ))}
            </Suspense>
          }
        />
      </Suspense>
    </div>
  )
}
