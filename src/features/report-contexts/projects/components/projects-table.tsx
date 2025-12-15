'use client'

import { IconArchive, IconArchiveOff } from '@tabler/icons-react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { InferResponseType } from 'hono'
import { useQueryStates } from 'nuqs'
import { Table } from '~/components/ui/intent-ui/table'
import { EditProjectModal } from '~/features/report-contexts/projects/components/edit-project-modal'
import { ProjectDeleteButton } from '~/features/report-contexts/projects/components/project-delete-button'
import { projectSearchParamsParsers } from '~/features/report-contexts/projects/types/search-params/project-search-params-cache'
import type { client } from '~/lib/rpc'
import { paginationSearchParamsParsers } from '~/types/search-params/pagination-search-params-cache'

type ProjectTableData = Pick<
  InferResponseType<typeof client.api.projects.$get, 200>['projects'][number],
  'id' | 'name' | 'isArchived' | 'likeKeywords' | 'clientId'
> &
  Record<
    'clientName',
    InferResponseType<typeof client.api.projects.$get, 200>['projects'][number]['client']['name']
  > &
  Record<'operate', string> &
  Record<'clients', InferResponseType<typeof client.api.clients.$get, 200>['clients']>

const columnHelper = createColumnHelper<ProjectTableData>()

const COLUMNS = [
  columnHelper.accessor('id', {
    header: 'プロジェクトID',
    cell: (info) => info.getValue(),
    enableSorting: false,
  }),
  columnHelper.accessor('name', {
    header: 'プロジェクト名',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('clientName', {
    id: 'clientName',
    header: 'クライアント名',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('isArchived', {
    id: 'status',
    header: 'アーカイブ',
    cell: (info) =>
      info.getValue() ? (
        <div className="flex items-center gap-x-1">
          アーカイブ済み
          <IconArchive stroke={1} />
        </div>
      ) : (
        <div className="flex items-center gap-x-1">
          アーカイブなし
          <IconArchiveOff stroke={1} />
        </div>
      ),
    enableSorting: true,
  }),
  columnHelper.accessor('operate', {
    header: '操作',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <EditProjectModal
              id={row.original.id}
              name={row.original.name}
              likeKeywords={row.original.likeKeywords}
              isArchived={row.original.isArchived}
              clientId={row.original.clientId}
              clients={row.original.clients}
            />
            <ProjectDeleteButton id={row.original.id} name={row.original.name} />
          </div>
        </div>
      )
    },
  }),
]

type ProjectsTableProps = {
  data: InferResponseType<typeof client.api.projects.$get, 200>
  clients: InferResponseType<typeof client.api.clients.$get, 200>['clients']
}

export function ProjectsTable({ data, clients }: ProjectsTableProps) {
  const initialData: ProjectTableData[] = data.projects.map((project) => ({
    id: project.id,
    name: project.name,
    likeKeywords: project.likeKeywords,
    isArchived: project.isArchived,
    clientId: project.clientId,
    clientName: project.client.name,
    operate: '',
    clients,
  }))

  const [{ rowsPerPage, sortBy, sortOrder }, setQueryStates] = useQueryStates(
    {
      ...paginationSearchParamsParsers,
      ...projectSearchParamsParsers,
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
          sortBy:
            firstSort.id === 'name'
              ? 'name'
              : firstSort.id === 'status'
                ? 'status'
                : firstSort.id === 'clientName'
                  ? 'clientName'
                  : null,
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
