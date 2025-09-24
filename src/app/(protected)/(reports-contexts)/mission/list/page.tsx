import { redirect, unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Card } from '~/components/ui/intent-ui/card'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { RowsPerPageSelect } from '~/components/ui/pagination/rows-per-page-select'
import { MAX_ROWS_PER_PAGE, MIN_ROWS_PER_PAGE } from '~/constants'
import { NameSearchTagField } from '~/features/report-contexts/components/name-search-tag-field'
import { ReportContextMenu } from '~/features/report-contexts/components/report-context-menu'
import { ReportContextTablePagination } from '~/features/report-contexts/components/report-context-table-pagination'
import { CreateMissionModal } from '~/features/report-contexts/missions/components/create-mission-modal'
import { MissionsTable } from '~/features/report-contexts/missions/components/missions-table'
import { getMissions } from '~/features/report-contexts/missions/server/fetcher'
import { getProjects } from '~/features/report-contexts/projects/server/fetcher'
import { nameSearchParamsCache } from '~/features/report-contexts/types/search-params/name-search-params-cache'
import { getServerSession } from '~/lib/get-server-session'
import type { NextPageProps } from '~/types'
import { paginationSearchParamsCache } from '~/types/search-params/pagination-search-params-cache'

export default async function MissionListPage({
  searchParams,
}: NextPageProps<undefined, SearchParams>) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const [{ names }, { page, rowsPerPage }] = await Promise.all([
    nameSearchParamsCache.parse(searchParams),
    paginationSearchParamsCache.parse(searchParams),
  ])

  const missionsPromise = getMissions(
    {
      skip: page <= 1 ? 0 : (page - 1) * rowsPerPage,
      limit:
        rowsPerPage > MAX_ROWS_PER_PAGE
          ? MAX_ROWS_PER_PAGE
          : rowsPerPage < MIN_ROWS_PER_PAGE
            ? MIN_ROWS_PER_PAGE
            : rowsPerPage,
      names,
    },
    session.user.id,
  )

  const projectsPromise = getProjects(undefined, session.user.id)

  return (
    <div className="flex flex-col gap-y-2 p-4 lg:p-6">
      <div className="flex justify-between">
        <Heading>ミッション一覧</Heading>
        <div className="flex flex-col gap-2">
          <Suspense fallback={<Skeleton className="h-8 w-44.5" />}>
            {projectsPromise.then((res) => (
              <CreateMissionModal projects={res.projects} />
            ))}
          </Suspense>
          <ReportContextMenu label="ミッション" />
        </div>
      </div>
      <div className="flex flex-row items-center gap-x-4 md:flex-col md:items-start md:gap-y-4">
        <NameSearchTagField label="ミッション名" />
        <RowsPerPageSelect />
      </div>
      <Card className="mt-4 max-w-full border-t-0 pt-0 ">
        <Card.Content>
          <Suspense
            key={JSON.stringify({ page, rowsPerPage, names })}
            fallback={
              <table className="w-full text-left font-normal text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3">ミッションID</th>
                    <th className="p-3">ミッション名</th>
                    <th className="p-3">プロジェクト名</th>
                    <th className="p-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 10 }, () => (
                    <tr key={crypto.randomUUID()} className="border-b">
                      <th scope="row" className="p-4">
                        <Skeleton className="h-4 w-64" />
                      </th>
                      <th scope="row" className="p-4">
                        <Skeleton className="h-4 w-25" />
                      </th>
                      <th scope="row" className="p-4">
                        <Skeleton className="h-4 w-25" />
                      </th>
                      <th scope="row" className="flex items-center gap-x-2 p-4">
                        <Skeleton className="h-9 w-19" />
                        <Skeleton className="h-9 w-19" />
                      </th>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          >
            {Promise.all([missionsPromise, projectsPromise]).then(
              ([missionsResponse, projectsResponse]) => (
                <MissionsTable data={missionsResponse} projects={projectsResponse.projects} />
              ),
            )}
          </Suspense>
        </Card.Content>
        <Card.Footer>
          <Suspense
            fallback={
              <div className="flex items-center justify-center gap-x-1">
                <Skeleton className="h-9 w-10 rounded-md" />
                <Skeleton className="h-9 w-10 rounded-md" />
                <Skeleton className="h-9 w-10 rounded-md" />
                <Skeleton className="h-9 w-10 rounded-md" />
                <Skeleton className="h-9 w-10 rounded-md" />
                <Skeleton className="h-9 w-10 rounded-md" />
                <Skeleton className="h-9 w-10 rounded-md" />
                <Skeleton className="h-9 w-10 rounded-md" />
                <Skeleton className="h-9 w-10 rounded-md" />
                <Skeleton className="h-9 w-10 rounded-md" />
              </div>
            }
          >
            {missionsPromise.then((res) => {
              const pageCount = Math.ceil(res.total / rowsPerPage)

              if (page > pageCount) {
                redirect(
                  `/mission/list?page=${pageCount}&rowsPerPage=${rowsPerPage}&names=${names}`,
                )
              }

              return <ReportContextTablePagination page={page} pageCount={pageCount} />
            })}
          </Suspense>
        </Card.Footer>
      </Card>
    </div>
  )
}
