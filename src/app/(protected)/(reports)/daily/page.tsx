import { unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { getMissions } from '~/features/missions/server/fetcher'
import { getProjects } from '~/features/projects/server/fetcher'
import { CreateDailyForm } from '~/features/reports/daily/components/create-daily-form'
import { ReportContentInputEntries } from '~/features/reports/daily/components/report-content-input-entries'
import { inputCountSearchParamsCache } from '~/features/reports/daily/types/search-params/input-count-search-params-cache'
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
    <div className="p-4 lg:p-6">
      <Heading>日報作成</Heading>
      <CreateDailyForm>
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
