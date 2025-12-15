'use client'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useQueryStates } from 'nuqs'
import { Table } from '~/components/ui/intent-ui/table'
import { AppealCategoryDeleteButton } from '~/features/report-contexts/appeals/components/appeal-category-delete-button'
import { EditAppealCategoryModal } from '~/features/report-contexts/appeals/components/edit-appeal-category-modal'
import { nameSearchParamsParsers } from '~/features/report-contexts/types/search-params/name-search-params-cache'
import type { AppealCategoriesResponse } from '~/features/reports/daily/types/api-response'
import { paginationSearchParamsParsers } from '~/types/search-params/pagination-search-params-cache'

type AppealCategoryTableData = Pick<
  AppealCategoriesResponse['appealCategories'][number],
  'id' | 'name'
> &
  Record<'operate', string>

const columnHelper = createColumnHelper<AppealCategoryTableData>()

const COLUMNS = [
  columnHelper.accessor('id', {
    header: 'カテゴリーID',
    cell: (info) => info.getValue(),
    enableSorting: false,
  }),
  columnHelper.accessor('name', {
    header: 'カテゴリー名',
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
            <EditAppealCategoryModal id={row.original.id} name={row.original.name} />
            <AppealCategoryDeleteButton id={row.original.id} name={row.original.name} />
          </div>
        </div>
      )
    },
  }),
]

export function AppealCategoriesTable({ data }: Record<'data', AppealCategoriesResponse>) {
  const initialData: AppealCategoryTableData[] = data.appealCategories.map((category) => ({
    id: category.id,
    name: category.name,
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
