import { IconPlus } from '@intentui/icons'
import { Suspense } from 'react'
import { Button } from '~/components/ui/intent-ui/button'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { getAppealCategories } from '~/features/report-contexts/appeals/server/fetcher'
import { getTroubleCategories } from '~/features/report-contexts/troubles/server/fetcher'
import { ReportAppealAndTroubleInputEntries } from '~/features/reports/daily/components/report-appeal-and-troubles-input-entries'
import type {
  AppealCategoriesResponse,
  TroubleCategoriesResponse,
} from '~/features/reports/daily/types/api-response'

export type Kind = 'appeal' | 'trouble'

type ReportAppealOrTroubleContainerProps = {
  kind: Kind
  reportId?: NonNullable<Parameters<typeof getAppealCategories>[0]>['reportId']
  userId: NonNullable<Parameters<typeof getAppealCategories>[1]>
  count?: number
}

export function ReportAppealOrTroubleContainer({
  kind,
  reportId,
  userId,
  count = 3,
}: ReportAppealOrTroubleContainerProps) {
  return (
    <Suspense
      fallback={
        <>
          <Button size="square-petite" className="mt-4 rounded-full">
            <IconPlus />
          </Button>

          {Array.from({ length: count }).map(() => (
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
      {kind === 'trouble'
        ? getTroubleCategories({ withData: true }, userId).then((res) => (
            <ReportAppealAndTroubleInputEntries<TroubleCategoriesResponse['troubleCategories']>
              items={res.troubleCategories}
              kind="trouble"
              unResolvedTroubles={res.unResolvedTroubles}
            />
          ))
        : getAppealCategories(reportId ? { withData: true, reportId } : undefined, userId).then(
            (res) => (
              <ReportAppealAndTroubleInputEntries<AppealCategoriesResponse['appealCategories']>
                items={res.appealCategories}
                kind="appeal"
                existingAppeals={res.existingAppeals}
              />
            ),
          )}
    </Suspense>
  )
}
