import { unauthorized } from 'next/navigation'
import { Heading } from '~/components/ui/intent-ui/heading'
import { getAppealCategories } from '~/features/report-contexts/appeals/server/fetcher'
import { getMissions } from '~/features/report-contexts/missions/server/fetcher'
import { getProjects } from '~/features/report-contexts/projects/server/fetcher'
import { getTroubleCategories } from '~/features/report-contexts/troubles/server/fetcher'
import { CreateDailyForm } from '~/features/reports/daily/components/create-daily-form'
import { getServerSession } from '~/lib/get-server-session'

export default async function Home() {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const projectPromise = getProjects(session.user.id, { isArchived: false })
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
      <CreateDailyForm promises={promises} />
    </div>
  )
}
