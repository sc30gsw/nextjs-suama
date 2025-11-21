import { unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Heading } from '~/components/ui/intent-ui/heading'
import { getMissions } from '~/features/report-contexts/missions/server/fetcher'
import { getProjects } from '~/features/report-contexts/projects/server/fetcher'
import { CreateDailyForm } from '~/features/reports/daily/components/create-daily-form'
import { ReportAppealOrTroubleContainer } from '~/features/reports/daily/components/report-appeal-or-trouble-container'
import { inputCountSearchParamsCache } from '~/features/reports/daily/types/search-params/input-count-search-params-cache'
import { getServerSession } from '~/lib/get-server-session'
import type { NextPageProps } from '~/types'

export default async function Home({ searchParams }: NextPageProps<undefined, SearchParams>) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const { appealsAndTroublesEntry } = await inputCountSearchParamsCache.parse(searchParams)

  const troubleCount = appealsAndTroublesEntry.troubles.count
  const appealCount = appealsAndTroublesEntry.appeals.count

  const projectPromise = getProjects(session.user.id, { isArchived: false })
  const missionPromise = getMissions(session.user.id, { isArchived: false })

  const promises = Promise.all([projectPromise, missionPromise])

  return (
    <div className="flex flex-col gap-y-2 p-4 lg:p-6">
      <Heading>日報作成</Heading>
      <CreateDailyForm
        promises={promises}
        troubleHeadings={
          <div className="mt-4 flex items-center">
            <Heading level={3}>困っていること</Heading>
          </div>
        }
        troubles={
          <ReportAppealOrTroubleContainer
            kind="trouble"
            count={troubleCount > 0 ? troubleCount : 0}
          />
        }
        appealHeadings={
          <div className="mt-4 flex items-center">
            <Heading level={3}>アピールポイント</Heading>
          </div>
        }
        appeals={
          <ReportAppealOrTroubleContainer kind="appeal" count={appealCount > 0 ? appealCount : 0} />
        }
      />
    </div>
  )
}
