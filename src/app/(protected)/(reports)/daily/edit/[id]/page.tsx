import Link from 'next/link'
import { unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Button } from '~/components/ui/intent-ui/button'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { getMissions } from '~/features/report-contexts/missions/server/fetcher'
import { getProjects } from '~/features/report-contexts/projects/server/fetcher'
import { EditDailyForm } from '~/features/reports/daily/components/edit-daily-form'
import { ReportAppealOrTroubleContainer } from '~/features/reports/daily/components/report-appeal-or-trouble-container'
import { getDailyReportById } from '~/features/reports/daily/server/fetcher'
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

  const reportData = await getDailyReportById(reportId, session.user.id)

  const projectPromise = getProjects(session.user.id, { isArchived: false })
  const missionPromise = getMissions(session.user.id, { isArchived: false })

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
          troubles={<ReportAppealOrTroubleContainer kind="trouble" />}
          appealHeadings={
            <div className="mt-4 flex items-center">
              <Heading level={3}>アピールポイント</Heading>
            </div>
          }
          appeals={<ReportAppealOrTroubleContainer kind="appeal" reportId={reportId} />}
        />
      </Suspense>
    </div>
  )
}
