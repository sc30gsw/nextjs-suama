import { redirect, unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Card } from '~/components/ui/intent-ui/card'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { RowsPerPageSelect } from '~/components/ui/pagination/rows-per-page-select'
import { getClients } from '~/features/report-contexts/clients/server/fetcher'
import { NameSearchTagField } from '~/features/report-contexts/components/name-search-tag-field'
import { ReportContextMenu } from '~/features/report-contexts/components/report-context-menu'
import { ReportContextTablePagination } from '~/features/report-contexts/components/report-context-table-pagination'
import { CreateProjectModal } from '~/features/report-contexts/projects/components/create-project-modal'
import { ProjectsTable } from '~/features/report-contexts/projects/components/projects-table'
import { getProjects } from '~/features/report-contexts/projects/server/fetcher'
import { nameSearchParamsCache } from '~/features/report-contexts/types/search-params/name-search-params-cache'
import { getServerSession } from '~/lib/get-server-session'
import type { NextPageProps } from '~/types'
import { paginationSearchParamsCache } from '~/types/search-params/pagination-search-params-cache'
import { paginationUtils } from '~/utils/pagination-utils'

export default async function ProjectListPage({
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

  const projectsPromise = getProjects(session.user.id, {
    skip: paginationUtils.getOffset(page, rowsPerPage),
    limit: paginationUtils.getMaxRowsLimit(rowsPerPage),
    names,
  })

  const clientsPromise = getClients(session.user.id, undefined)

  return (
    <div className="flex flex-col gap-y-2 p-4 lg:p-6">
      <div className="flex justify-between">
        <Heading>プロジェクト一覧</Heading>
        <div className="flex flex-col gap-2">
          <Suspense fallback={<Skeleton className="h-8 w-44.5" />}>
            {clientsPromise.then((res) => (
              <CreateProjectModal clients={res.clients} />
            ))}
          </Suspense>

          <ReportContextMenu label="プロジェクト" />
        </div>
      </div>
      <div className="flex flex-row items-center gap-x-4 md:flex-col md:items-start md:gap-y-4">
        <NameSearchTagField label="プロジェクト名" />
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
                    <th className="p-3">プロジェクトID</th>
                    <th className="p-3">プロジェクト名</th>
                    <th className="p-3">クライアント名</th>
                    <th className="p-3">アーカイブ</th>
                    <th className="p-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 10 }, () => (
                    <tr key={crypto.randomUUID()} className="border-b">
                      <th scope="row" className="p-4">
                        <Skeleton className="h-4 w-90" />
                      </th>
                      <th scope="row" className="p-4">
                        <Skeleton className="h-4 w-30" />
                      </th>
                      <th scope="row" className="p-4">
                        <Skeleton className="h-4 w-30" />
                      </th>
                      <th scope="row" className="p-4">
                        <Skeleton className="h-4 w-30" />
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
            {Promise.all([projectsPromise, clientsPromise]).then(
              ([projectResponse, clientsResponse]) => (
                <ProjectsTable data={projectResponse} clients={clientsResponse.clients} />
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
            {projectsPromise.then((res) => {
              const pageCount = Math.ceil(res.total / rowsPerPage)

              if (page > pageCount) {
                redirect(
                  `/project/list?page=${pageCount}&rowsPerPage=${rowsPerPage}&names=${names}`,
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
