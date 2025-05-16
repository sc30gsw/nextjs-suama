'use client'

import { IconDocumentEdit, IconTrashEmpty } from '@intentui/icons'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { InferResponseType } from 'hono'
import { useQueryStates } from 'nuqs'
import { Button } from '~/components/ui/intent-ui/button'
import { Table } from '~/components/ui/intent-ui/table'
import type { client } from '~/lib/rpc'
import { paginationSearchParamsParsers } from '~/types/search-params/pagination-search-params-cache'

type UserTableData = {
  id: string
  username: string
  operate: string
  currentUserId: string
}

const columnHelper = createColumnHelper<UserTableData>()

const COLUMNS = [
  columnHelper.accessor('id', {
    header: 'ユーザーID',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('username', {
    header: 'ユーザー名',
    cell: (info) => info.getValue(),
  }),

  columnHelper.accessor('operate', {
    header: '操作',
    cell: ({ row }) => {
      // TODO: ここで実際のユーザー情報を取得して、現在のユーザーと比較するロジックを実装する
      const isCurrentUser = row.original.id !== row.original.currentUserId

      return (
        <div className="flex items-center gap-2">
          {isCurrentUser && (
            <div className="flex gap-2">
              <Button size="small">
                修正
                <IconDocumentEdit />
              </Button>
              <Button intent="danger" size="small">
                削除
                <IconTrashEmpty />
              </Button>
            </div>
          )}
        </div>
      )
    },
  }),
]

type UsersTableProps = {
  // TODO: 適切な型に修正（API側の修正でできるかも）
  users: InferResponseType<typeof client.api.users.$get, 200>
  currentUserId: string
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  const initialData: UserTableData[] = users.users.map((user) => ({
    id: user.id.toString(),
    username: user.username,
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
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
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
