import { redirect, unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Card } from '~/components/ui/intent-ui/card'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { RowsPerPageSelect } from '~/components/ui/pagination/rows-per-page-select'
import { ClientsTable } from '~/features/report-contexts/clients/components/clients-table'
import { CreateClientModal } from '~/features/report-contexts/clients/components/create-client-modal'
import { getClients } from '~/features/report-contexts/clients/server/fetcher'
import { NameSearchTagField } from '~/features/report-contexts/components/name-search-tag-field'
import { ReportContextMenu } from '~/features/report-contexts/components/report-context-menu'
import { ReportContextTablePagination } from '~/features/report-contexts/components/report-context-table-pagination'
import { nameSearchParamsCache } from '~/features/report-contexts/types/search-params/name-search-params-cache'
import { getServerSession } from '~/lib/get-server-session'
import type { NextPageProps } from '~/types'
import { paginationSearchParamsCache } from '~/types/search-params/pagination-search-params-cache'
import { paginationUtils } from '~/utils/pagination-utils'

export default async function ClientListPage({
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

  const clientsPromise = getClients(session.user.id, {
    skip: paginationUtils.calculateSkip(page, rowsPerPage),
    limit: paginationUtils.maxRowsLimit(rowsPerPage),
    names,
  })

  return (
    <div className="flex flex-col gap-y-2 p-4 lg:p-6">
      <div className="flex justify-between">
        <Heading>クライアント一覧</Heading>
        <div className="flex flex-col gap-2">
          <CreateClientModal />
          <ReportContextMenu label="クライアント" />
        </div>
      </div>
      <div className="flex flex-row items-center gap-x-4 md:flex-col md:items-start md:gap-y-4">
        <NameSearchTagField label="クライアント名" />
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
                    <th className="w-28.25 p-3">クライアントID</th>
                    <th className="w-24.25 p-3">クライアント名</th>
                    <th className="w-90 p-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 10 }, () => (
                    <tr key={crypto.randomUUID()} className="border-b">
                      <th scope="row" className="p-4">
                        <Skeleton className="h-4 w-60" />
                      </th>
                      <th scope="row" className="p-4">
                        <Skeleton className="h-4 w-56" />
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
            {clientsPromise.then((res) => (
              <ClientsTable data={res} />
            ))}
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
            {clientsPromise.then((res) => {
              const pageCount = Math.ceil(res.total / rowsPerPage)

              if (page > pageCount) {
                redirect(`/client/list?page=${pageCount}&rowsPerPage=${rowsPerPage}&names=${names}`)
              }

              return <ReportContextTablePagination page={page} pageCount={pageCount} />
            })}
          </Suspense>
        </Card.Footer>
      </Card>
    </div>
  )
}
