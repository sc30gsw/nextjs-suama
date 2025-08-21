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
  }),
  columnHelper.accessor('name', {
    header: 'プロジェクト名',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('clientName', {
    header: 'クライアント名',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('isArchived', {
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
  }),
  columnHelper.accessor('operate', {
    header: '操作',
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
            <ProjectDeleteButton id={row.original.id} />
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
