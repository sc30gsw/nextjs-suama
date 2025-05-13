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

type ClientTableData = {
  id: string
  clientName: string
  operate: string
}

const columnHelper = createColumnHelper<ClientTableData>()

const COLUMNS = [
  columnHelper.accessor('id', {
    header: 'クライアントID',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('clientName', {
    header: 'クライアント名',
    cell: (info) => info.getValue(),
  }),

  columnHelper.accessor('operate', {
    header: '操作',
    cell: () => {
      return (
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <Button size="small">
              編集
              <IconDocumentEdit />
            </Button>
            <Button intent="danger" size="small">
              削除
              <IconTrashEmpty />
            </Button>
          </div>
        </div>
      )
    },
  }),
]

type ClientsTableProps = {
  // TODO: 適切な型に修正（API側の修正でできるかも）
  clients: InferResponseType<typeof client.api.clients.$get, 200>
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const initialData: ClientTableData[] = clients.users.map((user) => ({
    id: user.id.toString(),
    clientName: user.username,
    operate: '',
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
    pageCount: Math.ceil(clients.total / rowsPerPage),
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
          <Table.Row key={row.id}>
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
