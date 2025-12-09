'use client'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useQueryStates } from 'nuqs'
import { Table } from '~/components/ui/intent-ui/table'
import { EditTroubleCategoryModal } from '~/features/report-contexts/troubles/components/edit-trouble-category-modal'
import { TroubleCategoryDeleteButton } from '~/features/report-contexts/troubles/components/trouble-category-delete-button'
import type { TroubleCategoriesResponse } from '~/features/reports/daily/types/api-response'
import { paginationSearchParamsParsers } from '~/types/search-params/pagination-search-params-cache'

type TroubleCategoryTableData = Pick<
  TroubleCategoriesResponse['troubleCategories'][number],
  'id' | 'name'
> &
  Record<'operate', string>

const columnHelper = createColumnHelper<TroubleCategoryTableData>()

const COLUMNS = [
  columnHelper.accessor('id', {
    header: 'カテゴリーID',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('name', {
    header: 'カテゴリー名',
    cell: (info) => info.getValue(),
  }),

  columnHelper.accessor('operate', {
    header: '操作',
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <EditTroubleCategoryModal id={row.original.id} name={row.original.name} />
            <TroubleCategoryDeleteButton id={row.original.id} name={row.original.name} />
          </div>
        </div>
      )
    },
  }),
]

export function TroubleCategoriesTable({ data }: Record<'data', TroubleCategoriesResponse>) {
  const initialData: TroubleCategoryTableData[] = data.troubleCategories.map((category) => ({
    id: category.id,
    name: category.name,
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
    pageCount: Math.ceil(data.total / rowsPerPage),
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
