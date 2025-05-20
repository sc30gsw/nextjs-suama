import { IconPlus } from '@intentui/icons'
import { unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Button } from '~/components/ui/intent-ui/button'
import { Checkbox } from '~/components/ui/intent-ui/checkbox'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Separator } from '~/components/ui/intent-ui/separator'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { getAppealCategories } from '~/features/report-contexts/appeals/server/fetcher'
import { getMissions } from '~/features/report-contexts/missions/server/fetcher'
import { getProjects } from '~/features/report-contexts/projects/server/fetcher'
import { getTroubleCategories } from '~/features/report-contexts/troubles/server/fetcher'
import { CreateDailyForm } from '~/features/reports/daily/components/create-daily-form'
import { ReportAppealAndTroubleInputEntries } from '~/features/reports/daily/components/report-appeal-and-troubles-input-entries'

import { ReportContentInputEntries } from '~/features/reports/daily/components/report-content-input-entries'
import type {
  AppealCategoriesResponse,
  TroubleCategoriesResponse,
} from '~/features/reports/daily/types/api-response'
import { inputCountSearchParamsCache } from '~/features/reports/daily/types/search-params/input-count-search-params-cache'
import { getServerSession } from '~/lib/get-server-session'
import type { NextPageProps } from '~/types'

export default async function Home({
  searchParams,
}: NextPageProps<undefined, SearchParams>) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const { reportEntry, appealsAndTroublesEntry } =
    await inputCountSearchParamsCache.parse(searchParams)

  const count = reportEntry.count
  const troubleCount = appealsAndTroublesEntry.troubles.count
  const appealCount = appealsAndTroublesEntry.appeals.count

  const promises = Promise.all([
    getProjects(undefined, session.user.id),
    getMissions(undefined, session.user.id),
  ])

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-y-2">
      <Heading>日報作成</Heading>
      <CreateDailyForm
        troubleHeadings={
          <div className="flex items-center mt-4">
            <Heading level={3}>困っていること</Heading>
          </div>
        }
        troubles={
          <Suspense
            fallback={
              <>
                <Button size="square-petite" className="rounded-full mt-4">
                  <IconPlus />
                </Button>
                {Array.from({
                  length: troubleCount > 0 ? troubleCount : 0,
                }).map(() => (
                  <div
                    key={crypto.randomUUID()}
                    className="grid grid-cols-12 grid-rows-1 items-center gap-4 mx-auto py-2"
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
              <ReportAppealAndTroubleInputEntries<
                TroubleCategoriesResponse['troubleCategories']
              >
                items={res.troubleCategories}
                kind="trouble"
              />
            ))}
          </Suspense>
        }
        appealHeadings={
          <div className="flex items-center mt-4">
            <Heading level={3}>アピールポイント</Heading>
          </div>
        }
        appeals={
          <Suspense
            fallback={
              <>
                <Button size="square-petite" className="rounded-full mt-4">
                  <IconPlus />
                </Button>
                {Array.from({
                  length: appealCount > 0 ? appealCount : 0,
                }).map(() => (
                  <div
                    key={crypto.randomUUID()}
                    className="grid grid-cols-12 grid-rows-1 items-center gap-4 mx-auto py-2"
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
              <ReportAppealAndTroubleInputEntries<
                AppealCategoriesResponse['appealCategories']
              >
                items={res.appealCategories}
                kind="appeal"
              />
            ))}
          </Suspense>
        }
      >
        <Suspense
          fallback={
            <>
              <Button size="square-petite" className="rounded-full mt-4">
                <IconPlus />
              </Button>
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
              <Separator orientation="horizontal" />

              <div className="my-4">
                <Checkbox className="cursor-pointer">リモート勤務</Checkbox>
              </div>
              <Separator orientation="horizontal" />
              <div className="flex items-center gap-x-2 my-4">
                <span className="text-sm">合計時間:</span>
                <Heading className="text-muted-fg text-lg">0時間</Heading>
              </div>
            </>
          }
        >
          {promises.then(([projectsResponse, missionsResponse]) => (
            <ReportContentInputEntries
              projects={projectsResponse.projects}
              missions={missionsResponse.missions}
            />
          ))}
        </Suspense>
      </CreateDailyForm>
    </div>
  )
}
