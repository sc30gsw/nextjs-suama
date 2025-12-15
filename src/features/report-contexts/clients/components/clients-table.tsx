'use client'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { InferResponseType } from 'hono'
import { useQueryStates } from 'nuqs'
import { Table } from '~/components/ui/intent-ui/table'
import { ClientDeleteButton } from '~/features/report-contexts/clients/components/client-delete-button'
import { EditClientModal } from '~/features/report-contexts/clients/components/edit-client-modal'
import { nameSearchParamsParsers } from '~/features/report-contexts/types/search-params/name-search-params-cache'
import type { client } from '~/lib/rpc'
import { paginationSearchParamsParsers } from '~/types/search-params/pagination-search-params-cache'

type ClientTableData = Pick<
  InferResponseType<typeof client.api.clients.$get, 200>['clients'][number],
  'id' | 'name' | 'likeKeywords'
> &
  Record<'operate', string>

const columnHelper = createColumnHelper<ClientTableData>()

const COLUMNS = [
  columnHelper.accessor('id', {
    header: 'クライアントID',
    cell: (info) => info.getValue(),
    enableSorting: false,
  }),
  columnHelper.accessor('name', {
    header: 'クライアント名',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),

  columnHelper.accessor('operate', {
    header: '操作',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <EditClientModal
              id={row.original.id}
              name={row.original.name}
              likeKeywords={row.original.likeKeywords}
            />
            <ClientDeleteButton id={row.original.id} name={row.original.name} />
          </div>
        </div>
      )
    },
  }),
]

type ClientsTableProps = {
  data: InferResponseType<typeof client.api.clients.$get, 200>
}

export function ClientsTable({ data }: ClientsTableProps) {
  const initialData: ClientTableData[] = data.clients.map((client) => ({
    id: client.id,
    name: client.name,
    likeKeywords: client.likeKeywords,
    operate: '',
  }))

  const [{ rowsPerPage, sortBy, sortOrder }, setQueryStates] = useQueryStates(
    {
      ...paginationSearchParamsParsers,
      ...nameSearchParamsParsers,
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
    columns: COLUMNS,
    getCoreRowModel: getCoreRowModel(),
    enableSorting: true,
    manualSorting: true,
    manualPagination: true,
    pageCount: Math.ceil(data.total / rowsPerPage),
    state: {
      sorting: sortingState,
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sortingState) : updater
      const firstSort = newSorting[0]

      if (firstSort) {
        setQueryStates({
          sortBy: firstSort.id === 'name' ? 'name' : null,
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
                          if (toggleSortingHandler) {
                            toggleSortingHandler({} as unknown)
                          }
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
