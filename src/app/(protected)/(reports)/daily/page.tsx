import { unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { getAppeals } from '~/features/appeals/server/fetcher'
import { getMissions } from '~/features/missions/server/fetcher'
import { getProjects } from '~/features/projects/server/fetcher'
import { CreateDailyForm } from '~/features/reports/daily/components/create-daily-form'
import { ReportAppealInputEntries } from '~/features/reports/daily/components/report-appeal-input-entries'

import { ReportContentInputEntries } from '~/features/reports/daily/components/report-content-input-entries copy'
import { ReportTroubleInputEntries } from '~/features/reports/daily/components/report-trouble-input-entries copy'
import { inputCountSearchParamsCache } from '~/features/reports/daily/types/search-params/input-count-search-params-cache'
import { getTroubles } from '~/features/troubles/server/fetcher'
import { getServerSession } from '~/lib/get-server-session'

export default async function Home({
  searchParams,
}: Record<'searchParams', Promise<SearchParams>>) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const { count } = await inputCountSearchParamsCache.parse(searchParams)

  const promises = Promise.all([
    getProjects(session.user.id),
    getMissions(session.user.id),
  ])

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-y-2">
      <Heading>日報作成</Heading>
      <CreateDailyForm
        troubles={
          <Suspense>
            {getTroubles(session.user.id).then((res) => (
              <ReportTroubleInputEntries troubles={res} />
            ))}
          </Suspense>
        }
        appeals={
          <Suspense>
            {getAppeals(session.user.id).then((res) => (
              <ReportAppealInputEntries appeals={res} />
            ))}
          </Suspense>
        }
      >
        <Suspense
          fallback={
            <>
              <Skeleton className="size-9 rounded-full mt-8" />
              {Array.from({ length: count > 0 ? count : 1 }).map(() => (
                <div
                  key={crypto.randomUUID()}
                  className="grid grid-cols-11 items-center grid-rows-1  mx-auto gap-4 mt-10"
                >
                  <Skeleton className="col-span-2 h-7" />
                  <Skeleton className="col-span-2 h-7" />
                  <Skeleton className="col-span-2 h-7" />
                  <Skeleton className="col-span-4 h-7" />
                  <Skeleton className="col-span-1 size-9 rounded-full" />
                </div>
              ))}
            </>
          }
        >
          {promises.then(([projects, missions]) => (
            <ReportContentInputEntries
              projects={projects}
              missions={missions}
            />
          ))}
        </Suspense>
      </CreateDailyForm>
    </div>
  )
}
