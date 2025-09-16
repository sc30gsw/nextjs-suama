import { IconPlus } from '@intentui/icons'
import { eq } from 'drizzle-orm'
import { format } from 'date-fns'
import Link from 'next/link'
import { notFound, unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Button } from '~/components/ui/intent-ui/button'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { dailyReports } from '~/db/schema'
import { getAppealCategories } from '~/features/report-contexts/appeals/server/fetcher'
import { getMissions } from '~/features/report-contexts/missions/server/fetcher'
import { getProjects } from '~/features/report-contexts/projects/server/fetcher'
import { getTroubleCategories } from '~/features/report-contexts/troubles/server/fetcher'
import { EditDailyForm } from '~/features/reports/daily/components/edit-daily-form'
import { ReportAppealAndTroubleInputEntries } from '~/features/reports/daily/components/report-appeal-and-troubles-input-entries'
import type {
  AppealCategoriesResponse,
  TroubleCategoriesResponse,
} from '~/features/reports/daily/types/api-response'
import { db } from '~/index'
import { getServerSession } from '~/lib/get-server-session'
import type { NextPageProps } from '~/types'

export default async function EditDailyReportPage({
  params,
}: NextPageProps<{ id: string }, SearchParams>) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const reportId = (await params).id

  // 既存のレポートデータを取得
  const report = await db.query.dailyReports.findFirst({
    where: eq(dailyReports.id, reportId),
    with: {
      dailyReportMissions: {
        with: {
          mission: {
            with: {
              project: true,
            },
          },
        },
      },
      appeals: {
        with: {
          categoryOfAppeal: true,
        },
      },
    },
  })

  if (!report) {
    notFound()
  }

  // 自分のレポートかどうか確認
  if (report.userId !== session.user.id) {
    unauthorized()
  }

  // 初期データを整形
  const initialData = {
    reportDate: report.reportDate ? format(new Date(report.reportDate), 'yyyy-MM-dd') : '',
    remote: report.remote,
    impression: report.impression || '',
    reportEntries: report.dailyReportMissions.map((drm) => ({
      id: drm.id,
      project: drm.mission.project.name,
      mission: drm.mission.name,
      projectId: drm.mission.project.id,
      missionId: drm.mission.id,
      content: drm.workContent,
      hours: drm.hours || 0,
    })),
    appealEntries: report.appeals.map((appeal) => ({
      id: appeal.id,
      categoryId: appeal.categoryOfAppealId,
      content: appeal.appeal,
    })),
    troubleEntries: [], // TODO: troubles取得実装
  }

  const projectPromise = getProjects(undefined, session.user.id)
  const missionPromise = getMissions(undefined, session.user.id)

  const promises = Promise.all([projectPromise, missionPromise])

  return (
    <div className="flex flex-col gap-y-2 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <Heading>日報編集</Heading>
        <Link href="/daily/mine">
          <Button intent="outline">
            一覧に戻る
          </Button>
        </Link>
      </div>
      <EditDailyForm
        reportId={reportId}
        initialData={initialData}
        promises={promises}
        troubleHeadings={
          <div className="mt-4 flex items-center">
            <Heading level={3}>困っていること</Heading>
          </div>
        }
        troubles={
          <Suspense
            fallback={
              <>
                <Button size="square-petite" className="mt-4 rounded-full">
                  <IconPlus />
                </Button>
                {Array.from({ length: initialData.troubleEntries.length }).map(() => (
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
            {getTroubleCategories(undefined, session.user.id).then((res) => (
              <ReportAppealAndTroubleInputEntries<TroubleCategoriesResponse['troubleCategories']>
                items={res.troubleCategories}
                kind="trouble"
              />
            ))}
          </Suspense>
        }
        appealHeadings={
          <div className="mt-4 flex items-center">
            <Heading level={3}>アピールポイント</Heading>
          </div>
        }
        appeals={
          <Suspense
            fallback={
              <>
                <Button size="square-petite" className="mt-4 rounded-full">
                  <IconPlus />
                </Button>
                {Array.from({ length: initialData.appealEntries.length }).map(() => (
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
            {getAppealCategories(undefined, session.user.id).then((res) => (
              <ReportAppealAndTroubleInputEntries<AppealCategoriesResponse['appealCategories']>
                items={res.appealCategories}
                kind="appeal"
              />
            ))}
          </Suspense>
        }
      />
    </div>
  )
}