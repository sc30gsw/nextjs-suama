import { redirect, unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Card } from '~/components/ui/intent-ui/card'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { RowsPerPageSelect } from '~/components/ui/pagination/rows-per-page-select'
import { AppealCategoriesTable } from '~/features/report-contexts/appeals/components/appeal-categories-table'
import { CreateAppealCategoryModal } from '~/features/report-contexts/appeals/components/create-appeal-category-modal'
import { getAppealCategories } from '~/features/report-contexts/appeals/server/fetcher'
import { NameSearchTagField } from '~/features/report-contexts/components/name-search-tag-field'
import { ReportContextMenu } from '~/features/report-contexts/components/report-context-menu'
import { ReportContextTablePagination } from '~/features/report-contexts/components/report-context-table-pagination'
import { nameSearchParamsCache } from '~/features/report-contexts/types/search-params/name-search-params-cache'
import { getServerSession } from '~/lib/get-server-session'
import { urls } from '~/lib/urls'
import type { NextPageProps } from '~/types'
import { paginationSearchParamsCache } from '~/types/search-params/pagination-search-params-cache'
import { paginationUtils } from '~/utils/pagination-utils'

export default async function AppealListPage({
  searchParams,
}: NextPageProps<undefined, SearchParams>) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const [{ names, sortBy, sortOrder }, { page, rowsPerPage }] = await Promise.all([
    nameSearchParamsCache.parse(searchParams),
    paginationSearchParamsCache.parse(searchParams),
  ])

  const appealCategoriesPromise = getAppealCategories(session.user.id, {
    skip: paginationUtils.getOffset(page, rowsPerPage),
    limit: paginationUtils.getMaxRowsLimit(rowsPerPage),
    names,
    sortBy: sortBy as 'name' | undefined,
    sortOrder: sortOrder as 'asc' | 'desc' | undefined,
  })

  return (
    <div className="flex flex-col gap-y-2 p-4 lg:p-6">
      <div className="flex justify-between">
        <Heading>アピールポイントカテゴリー一覧</Heading>
        <div className="flex flex-col gap-2">
          <CreateAppealCategoryModal />
          <ReportContextMenu label="カテゴリー" categoryType="appeal" />
        </div>
      </div>
      <div className="flex flex-row items-center gap-x-4 md:flex-col md:items-start md:gap-y-4">
        <NameSearchTagField label="カテゴリー名" />
        <RowsPerPageSelect />
      </div>
      <Card className="mt-4 max-w-full border-t-0 pt-0 ">
        <Card.Content>
          <Suspense
            key={JSON.stringify({ page, rowsPerPage, names, sortBy, sortOrder })}
            fallback={
              <table className="w-full text-left font-normal text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3">カテゴリーID</th>
                    <th className="p-3">カテゴリー名</th>
                    <th className="p-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 10 }, () => (
                    <tr key={crypto.randomUUID()} className="border-b">
                      <th scope="row" className="p-4">
                        <Skeleton className="h-4 w-105" />
                      </th>
                      <th scope="row" className="p-4">
                        <Skeleton className="h-4 w-80" />
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
            {appealCategoriesPromise.then((res) => {
              if (!res) {
                return null
              }

              return <AppealCategoriesTable data={res} />
            })}
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
            {appealCategoriesPromise.then((res) => {
              if (!res || res.total === 0) {
                return null
              }

              const pageCount = Math.ceil(res.total / rowsPerPage)

              if (page > pageCount) {
                redirect(
                  urls.build({
                    route: '/appeal/list',
                    searchParams: { page: pageCount, rowsPerPage, names, sortBy, sortOrder },
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
