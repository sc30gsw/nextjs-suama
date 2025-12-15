import { redirect, unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Card } from '~/components/ui/intent-ui/card'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { RowsPerPageSelect } from '~/components/ui/pagination/rows-per-page-select'
import { TablePagination } from '~/components/ui/pagination/table-pagination'
import { RetiredFilterRadioGroup } from '~/features/users/components/retired-filter-radio-group'
import { UserSearchTagField } from '~/features/users/components/user-search-tag-field'
import { UsersTable } from '~/features/users/components/users-table'
import { getUsers } from '~/features/users/server/fetcher'
import { userSearchParamsCache } from '~/features/users/types/search-params/user-search-params-cache'
import { getServerSession } from '~/lib/get-server-session'
import { urls } from '~/lib/urls'
import type { NextPageProps } from '~/types'
import { paginationSearchParamsCache } from '~/types/search-params/pagination-search-params-cache'
import { paginationUtils } from '~/utils/pagination-utils'

export default async function UsersPage({ searchParams }: NextPageProps<undefined, SearchParams>) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const [{ userNames, retirementStatus }, { page, rowsPerPage }] = await Promise.all([
    userSearchParamsCache.parse(searchParams),
    paginationSearchParamsCache.parse(searchParams),
  ])

  const usersPromise = getUsers(session.user.id, {
    skip: paginationUtils.getOffset(page, rowsPerPage),
    limit: paginationUtils.getMaxRowsLimit(rowsPerPage),
    userNames,
    retirementStatus: retirementStatus ?? 'all',
  })

  return (
    <div className="flex flex-col gap-y-2 p-4 lg:p-6">
      <Heading>ユーザー一覧</Heading>
      <div className="flex flex-col gap-y-4">
        <UserSearchTagField />
        <RetiredFilterRadioGroup />
        <RowsPerPageSelect />
      </div>
      <Card className="mt-4 max-w-full border-t-0 pt-0 ">
        <Card.Content>
          <Suspense
            key={JSON.stringify({ page, rowsPerPage, userNames, retirementStatus })}
            fallback={
              <table className="w-full text-left font-normal text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="w-28.25 p-3">アイコン</th>
                    <th className="w-28.25 p-3">ユーザーID</th>
                    <th className="w-24.25 p-3">ユーザー名</th>
                    <th className="w-90 p-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 10 }, () => (
                    <tr key={crypto.randomUUID()} className="border-b">
                      <th scope="row" className="p-4 *:data-[slot=skeleton]:rounded-full">
                        <Skeleton className="mr-10 ml-3 size-8" />
                      </th>
                      <th scope="row" className="p-4">
                        <Skeleton className="h-4 w-75" />
                      </th>
                      <th scope="row" className="p-4">
                        <Skeleton className="h-4 w-50" />
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
            {usersPromise.then((res) => (
              <UsersTable
                users={res}
                currentUserId={session.user.id}
                currentUserRole={session.user.role}
              />
            ))}
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
            {usersPromise.then((res) => {
              if (res.total === 0) {
                return null
              }

              const pageCount = Math.ceil(res.total / rowsPerPage)

              if (page > pageCount) {
                redirect(
                  urls.build({
                    route: '/users',
                    searchParams: { page: pageCount, rowsPerPage, userNames, retirementStatus },
                  } as Parameters<typeof urls.build>[0] & {
                    searchParams?: Record<string, unknown>
                  }).href,
                )
              }

              return <TablePagination pageCount={pageCount} />
            })}
          </Suspense>
        </Card.Footer>
      </Card>
    </div>
  )
}
