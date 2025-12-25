import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { getMonth, getYear, parseISO } from 'date-fns'
import Link from 'next/link'
import { notFound, unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Button } from '~/components/ui/intent-ui/button'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { getAppealCategories } from '~/features/report-contexts/appeals/server/fetcher'
import { getMissions } from '~/features/report-contexts/missions/server/fetcher'
import { getProjects } from '~/features/report-contexts/projects/server/fetcher'
import { getTroubleCategories } from '~/features/report-contexts/troubles/server/fetcher'
import { EditDailyForm } from '~/features/reports/daily/components/edit-daily-form'
import { fetchDailyReportDatesQuery } from '~/features/reports/daily/queries/fetcher'
import { getDailyReportById } from '~/features/reports/daily/server/fetcher'
import { getServerSession } from '~/lib/get-server-session'
import { urls } from '~/lib/urls'
import type { NextPageProps } from '~/types'

export default async function EditDailyReportPage({
  params,
}: NextPageProps<Record<'id', string>, SearchParams>) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const queryClient = new QueryClient()

  const reportId = (await params).id

  const reportData = await getDailyReportById(reportId, session.user.id)

  if (!reportData) {
    notFound()
  }

  const reportDate = parseISO(reportData.reportDate)
  await fetchDailyReportDatesQuery(
    {
      query: {
        year: getYear(reportDate).toString(),
        month: (getMonth(reportDate) + 1).toString(),
        excludeReportId: reportId,
      },
    },
    session.user.id,
  ).prefetch(queryClient)

  const projectPromise = getProjects(session.user.id, { archiveStatus: 'active' })
  const missionPromise = getMissions(session.user.id, { archiveStatus: 'active' })
  const appealCategoriesPromise = getAppealCategories(session.user.id, {
    withData: true,
    reportId,
  })
  const troubleCategoriesPromise = getTroubleCategories(session.user.id, { withData: true })

  const promises = Promise.all([
    projectPromise,
    missionPromise,
    appealCategoriesPromise,
    troubleCategoriesPromise,
  ])

  return (
    <div className="flex flex-col gap-y-2 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <Heading>日報編集</Heading>
        <Link href={urls.href({ route: '/daily/mine' })}>
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
        <HydrationBoundary state={dehydrate(queryClient)}>
          <EditDailyForm userId={session.user.id} reportData={reportData} promises={promises} />
        </HydrationBoundary>
      </Suspense>
    </div>
  )
}
