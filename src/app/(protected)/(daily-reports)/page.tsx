import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { unauthorized } from 'next/navigation'
import { Heading } from '~/components/ui/intent-ui/heading'
import { getAppealCategories } from '~/features/report-contexts/appeals/server/fetcher'
import { getMissions } from '~/features/report-contexts/missions/server/fetcher'
import { getProjects } from '~/features/report-contexts/projects/server/fetcher'
import { getTroubleCategories } from '~/features/report-contexts/troubles/server/fetcher'
import { CreateDailyForm } from '~/features/reports/daily/components/create-daily-form'
import { fetchDailyReportDatesQuery } from '~/features/reports/daily/queries/fetcher'
import { getServerSession } from '~/lib/get-server-session'

export default async function Home() {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const queryClient = new QueryClient()

  const now = new Date()
  await fetchDailyReportDatesQuery(
    { query: { year: now.getFullYear().toString(), month: (now.getMonth() + 1).toString() } },
    session.user.id,
  ).prefetch(queryClient)

  const projectPromise = getProjects(session.user.id, { archiveStatus: 'active' })
  const missionPromise = getMissions(session.user.id, { isArchived: false })
  const appealCategoriesPromise = getAppealCategories(session.user.id)
  const troubleCategoriesPromise = getTroubleCategories(session.user.id, { withData: true })

  const promises = Promise.all([
    projectPromise,
    missionPromise,
    appealCategoriesPromise,
    troubleCategoriesPromise,
  ])

  return (
    <div className="flex flex-col gap-y-2 p-4 lg:p-6">
      <Heading>日報作成</Heading>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CreateDailyForm userId={session.user.id} promises={promises} />
      </HydrationBoundary>
    </div>
  )
}
