import { IconPlus } from '@intentui/icons'
import { unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Button } from '~/components/ui/intent-ui/button'
import { Checkbox } from '~/components/ui/intent-ui/checkbox'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Separator } from '~/components/ui/intent-ui/separator'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { getAppeals } from '~/features/appeals/server/fetcher'
import { getMissions } from '~/features/missions/server/fetcher'
import { getProjects } from '~/features/projects/server/fetcher'
import { CreateDailyForm } from '~/features/reports/daily/components/create-daily-form'
import { ReportAppealAndTroubleInputEntries } from '~/features/reports/daily/components/report-appeal-and-troubles-input-entries'
import { ReportContentInputEntries } from '~/features/reports/daily/components/report-content-input-entries'
import type {
  AppealResponse,
  TroubleResponse,
} from '~/features/reports/daily/types/api-response'
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

  const { appealsAndTroublesEntry } =
    await inputCountSearchParamsCache.parse(searchParams)
  console.log('🚀 ~ appealsAndTroublesEntry:', appealsAndTroublesEntry)

  const troubleCount = appealsAndTroublesEntry.troubles.count
  const appealCount = appealsAndTroublesEntry.appeals.count
  const count = Math.max(troubleCount, appealCount)

  const promises = Promise.all([
    getProjects(session.user.id),
    getMissions(session.user.id),
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
            {getTroubles(session.user.id).then((res) => (
              <ReportAppealAndTroubleInputEntries<TroubleResponse['troubles']>
                items={res}
                kind="trouble"
              />
            ))}
          </Suspense>
        }
        appealHeadings={
          <div className="flex items-center mt-4">
            <Heading level={3}>工夫したこと</Heading>
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
            {getAppeals(session.user.id).then((res) => (
              <ReportAppealAndTroubleInputEntries<AppealResponse['appeals']>
                items={res}
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
