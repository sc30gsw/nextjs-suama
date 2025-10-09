'use client'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { InferSelectModel } from 'drizzle-orm'
import type { InferResponseType } from 'hono'
import { useQueryStates } from 'nuqs'
import { Avatar } from '~/components/ui/intent-ui/avatar'
import { Table } from '~/components/ui/intent-ui/table'
import type { users } from '~/db/schema'
import { EditUserModal } from '~/features/users/components/edit-user-modal'
import { UserDeleteButton } from '~/features/users/components/user-delete-button'
import type { client } from '~/lib/rpc'
import { paginationSearchParamsParsers } from '~/types/search-params/pagination-search-params-cache'

type UserTableData = Pick<
  InferResponseType<typeof client.api.users.$get, 200>['users'][number],
  'id' | 'name' | 'image'
> &
  Record<'operate' | 'currentUserId', string>

const columnHelper = createColumnHelper<UserTableData>()

const COLUMNS = [
  columnHelper.accessor('image', {
    header: 'アイコン',
    cell: ({ row }) => <Avatar initials={row.original.name.charAt(0)} src={row.original.image} />,
  }),
  columnHelper.accessor('id', {
    header: 'ユーザーID',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('name', {
    header: 'ユーザー名',
    cell: (info) => info.getValue(),
  }),

  columnHelper.accessor('operate', {
    header: '操作',
    cell: ({ row }) => {
      const isCurrentUser = row.original.id === row.original.currentUserId

      return (
        <div className="flex items-center gap-2">
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
    id: user.id.toString(),
    name: user.name,
    image: user.image,
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
