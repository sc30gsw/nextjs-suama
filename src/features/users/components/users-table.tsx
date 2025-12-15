'use client'

import { IconCalendarCheck } from '@intentui/icons'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { InferSelectModel } from 'drizzle-orm'
import type { InferResponseType } from 'hono'
import Link from 'next/link'
import { useQueryStates } from 'nuqs'
import { Avatar } from '~/components/ui/intent-ui/avatar'
import { buttonStyles } from '~/components/ui/intent-ui/button'
import { Table } from '~/components/ui/intent-ui/table'
import { Tooltip } from '~/components/ui/intent-ui/tooltip'
import type { users } from '~/db/schema'
import { EditUserModal } from '~/features/users/components/edit-user-modal'
import { UserRetireButton } from '~/features/users/components/user-retire-button'
import { userSearchParamsParsers } from '~/features/users/types/search-params/user-search-params-cache'
import type { client } from '~/lib/rpc'
import { urls } from '~/lib/urls'
import { paginationSearchParamsParsers } from '~/types/search-params/pagination-search-params-cache'

type UserTableData = Pick<
  InferResponseType<typeof client.api.users.$get, 200>['users'][number],
  'id' | 'email' | 'name' | 'image' | 'isRetired'
> &
  Record<'operate' | 'currentUserId', string>

const columnHelper = createColumnHelper<UserTableData>()

const createColumns = (currentUserRole: 'admin' | 'user') => [
  columnHelper.accessor('image', {
    header: 'アイコン',
    cell: ({ row }) => <Avatar initials={row.original.name.charAt(0)} src={row.original.image} />,
    enableSorting: false,
  }),
  columnHelper.accessor('email', {
    header: 'メールアドレス',
    cell: (info) => info.getValue(),
    enableSorting: false,
  }),
  columnHelper.accessor('name', {
    header: 'ユーザー名',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('isRetired', {
    id: 'status',
    header: '在籍状態',
    cell: (info) => (info.getValue() ? '退職済み' : '在籍中'),
    enableSorting: true,
  }),
  columnHelper.accessor('operate', {
    header: '操作',
    enableSorting: false,
    cell: ({ row }) => {
      const isCurrentUser = row.original.id === row.original.currentUserId

      return (
        <div className="flex items-center gap-2">
          {/* ? layout.tsxでアクセス制限しているため、ここでのRole分岐は不要 */}
          <Tooltip delay={0}>
            <Link
              href={
                isCurrentUser
                  ? urls.href({ route: '/daily/mine' })
                  : urls.build({
                      route: '/daily/every',
                      searchParams: { userNames: row.original.name },
                    } as Parameters<typeof urls.build>[0] & {
                      searchParams?: Record<string, unknown>
                    }).href
              }
            >
              <Tooltip.Trigger className={buttonStyles({ size: 'sm', intent: 'outline' })}>
                <IconCalendarCheck />
              </Tooltip.Trigger>
            </Link>
            <Tooltip.Content>
              {isCurrentUser ? (
                '自分の日報'
              ) : (
                <p>
                  <b>{row.original.name}</b>の日報
                </p>
              )}
            </Tooltip.Content>
          </Tooltip>
          {isCurrentUser && (
            <div className="flex gap-2">
              <EditUserModal
                id={row.original.id}
                name={row.original.name}
                image={row.original.image ?? null}
              />
            </div>
          )}
          {/* ? 自身でも退職時に実行できるようにするため、自分の行にもボタンは表示するものとしている */}
          {currentUserRole === 'admin' && !row.original.isRetired && (
            <UserRetireButton id={row.original.id} name={row.original.name} />
          )}
        </div>
      )
    },
  }),
]

type UsersTableProps = {
  users: InferResponseType<typeof client.api.users.$get, 200>
  currentUserId: InferSelectModel<typeof users>['id']
  currentUserRole: 'admin' | 'user'
}

export function UsersTable({ users, currentUserId, currentUserRole }: UsersTableProps) {
  const initialData: UserTableData[] = users.users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    isRetired: user.isRetired ?? false,
    operate: '',
    currentUserId,
  }))

  const [{ rowsPerPage, sortBy, sortOrder }, setQueryStates] = useQueryStates(
    {
      ...paginationSearchParamsParsers,
      ...userSearchParamsParsers,
    },
    {
      history: 'push',
      shallow: false,
    },
  )

  const sortingState = sortBy
    ? [
        {
          id: sortBy,
          desc: sortOrder === 'desc',
        },
      ]
    : []

  const table = useReactTable({
    data: initialData,
    columns: createColumns(currentUserRole),
    getCoreRowModel: getCoreRowModel(),
    enableSorting: true,
    manualSorting: true,
    manualPagination: true,
    pageCount: Math.ceil(users.total / rowsPerPage),
    state: {
      sorting: sortingState,
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sortingState) : updater
      const firstSort = newSorting[0]

      if (firstSort) {
        setQueryStates({
          sortBy: firstSort.id === 'name' ? 'name' : firstSort.id === 'status' ? 'status' : null,
          sortOrder: firstSort.desc ? 'desc' : 'asc',
        })
      } else {
        setQueryStates({
          sortBy: null,
          sortOrder: null,
        })
      }
    },
  })

  return (
    <Table aria-label="Daily Reports">
      <Table.Header>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.Row key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const canSort = header.column.getCanSort()
              const toggleSortingHandler = canSort
                ? header.column.getToggleSortingHandler()
                : undefined
              const sortedState = header.column.getIsSorted()
              return (
                <Table.Column
                  key={header.id}
                  isRowHeader={true}
                  allowsSorting={canSort}
                  sortDirectionOverride={
                    sortedState === false
                      ? null
                      : sortedState === 'asc'
                        ? 'ascending'
                        : sortedState === 'desc'
                          ? 'descending'
                          : null
                  }
                  onSortClick={
                    toggleSortingHandler
                      ? () => {
                          toggleSortingHandler({} as React.MouseEvent)
                        }
                      : undefined
                  }
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </Table.Column>
              )
            })}
          </Table.Row>
        ))}
      </Table.Header>
      <Table.Body>
        {table.getRowModel().rows.map((row) => (
          <Table.Row key={row.original.id}>
            {row.getVisibleCells().map((cell) => (
              <Table.Cell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}
