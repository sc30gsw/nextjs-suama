import { redirect, unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Card } from '~/components/ui/intent-ui/card'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { RowsPerPageSelect } from '~/components/ui/pagination/rows-per-page-select'
import { getClients } from '~/features/report-contexts/clients/server/fetcher'
import { ArchiveStatusFilterRadioGroup } from '~/features/report-contexts/components/archive-status-filter-radio-group'
import { NameSearchTagField } from '~/features/report-contexts/components/name-search-tag-field'
import { ReportContextMenu } from '~/features/report-contexts/components/report-context-menu'
import { ReportContextTablePagination } from '~/features/report-contexts/components/report-context-table-pagination'
import { CreateProjectModal } from '~/features/report-contexts/projects/components/create-project-modal'
import { ProjectsTable } from '~/features/report-contexts/projects/components/projects-table'
import { getProjects } from '~/features/report-contexts/projects/server/fetcher'
import { archiveStatusSearchParamsCache } from '~/features/report-contexts/types/search-params/archive-status-search-params-cache'
import { nameSearchParamsCache } from '~/features/report-contexts/types/search-params/name-search-params-cache'
import { getServerSession } from '~/lib/get-server-session'
import { urls } from '~/lib/urls'
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

  const resolvedSearchParams = await searchParams

  const [{ names, sortBy, sortOrder }, { archiveStatus }, { page, rowsPerPage }] =
    await Promise.all([
      nameSearchParamsCache.parse(resolvedSearchParams),
      archiveStatusSearchParamsCache.parse(resolvedSearchParams),
      paginationSearchParamsCache.parse(resolvedSearchParams),
    ])

  const projectsPromise = getProjects(session.user.id, {
    skip: paginationUtils.getOffset(page, rowsPerPage),
    limit: paginationUtils.getMaxRowsLimit(rowsPerPage),
    names,
    archiveStatus: archiveStatus ?? 'all',
    sortBy: sortBy ?? null,
    sortOrder: sortOrder ?? null,
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
      <div className="flex flex-col gap-y-4">
        <NameSearchTagField label="プロジェクト名・クライアント名" />
        <ArchiveStatusFilterRadioGroup type="project" />
        <RowsPerPageSelect />
      </div>
      <Card className="mt-4 max-w-full border-t-0 pt-0 ">
        <Card.Content>
          <Suspense
            key={JSON.stringify({
              page,
              rowsPerPage,
              names,
              archiveStatus: archiveStatus ?? 'all',
              sortBy,
              sortOrder,
            })}
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
              <div className="flex w-full items-center justify-center gap-x-1">
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
              if (res.total === 0) {
                return null
              }

              const pageCount = Math.ceil(res.total / rowsPerPage)

              if (page > pageCount) {
                redirect(
                  urls.build({
                    route: '/project/list',
                    searchParams: {
                      page: pageCount,
                      rowsPerPage,
                      names,
                      archiveStatus: archiveStatus ?? 'all',
                      sortBy,
                      sortOrder,
                    },
                  } as Parameters<typeof urls.build>[0] & {
                    searchParams?: Record<string, unknown>
                  }).href,
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
