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
import { UserDeleteButton } from '~/features/users/components/user-delete-button'
import type { client } from '~/lib/rpc'
import { urls } from '~/lib/urls'
import { paginationSearchParamsParsers } from '~/types/search-params/pagination-search-params-cache'

type UserTableData = Pick<
  InferResponseType<typeof client.api.users.$get, 200>['users'][number],
  'id' | 'email' | 'name' | 'image' | 'isRetired'
> &
  Record<'operate' | 'currentUserId', string>

const columnHelper = createColumnHelper<UserTableData>()

const COLUMNS = [
  columnHelper.accessor('image', {
    header: 'アイコン',
    cell: ({ row }) => <Avatar initials={row.original.name.charAt(0)} src={row.original.image} />,
  }),
  columnHelper.accessor('email', {
    header: 'メールアドレス',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('name', {
    header: 'ユーザー名',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('isRetired', {
    header: '退職済み',
    cell: (info) => (info.getValue() ? '退職済み' : '在籍中'),
  }),
  columnHelper.accessor('operate', {
    header: '操作',
    cell: ({ row }) => {
      const isCurrentUser = row.original.id === row.original.currentUserId

      return (
        <div className="flex items-center gap-2">
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
              <UserDeleteButton id={row.original.id} />
            </div>
          )}
        </div>
      )
    },
  }),
]

type UsersTableProps = {
  users: InferResponseType<typeof client.api.users.$get, 200>
  currentUserId: InferSelectModel<typeof users>['id']
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  const initialData: UserTableData[] = users.users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    isRetired: user.isRetired ?? false,
    operate: '',
    currentUserId,
  }))

  const [{ rowsPerPage }] = useQueryStates(paginationSearchParamsParsers, {
    history: 'push',
    shallow: false,
  })

  const table = useReactTable({
    data: initialData,
    columns: COLUMNS,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(users.total / rowsPerPage),
  })

  return (
    <Table aria-label="Daily Reports">
      <Table.Header>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.Row key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <Table.Column key={header.id} isRowHeader={true}>
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </Table.Column>
            ))}
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
