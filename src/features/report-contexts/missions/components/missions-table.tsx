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
import { EditMissionModal } from '~/features/report-contexts/missions/components/edit-mission-modal'
import { MissionDeleteButton } from '~/features/report-contexts/missions/components/mission-delete-button'
import type { client } from '~/lib/rpc'
import { paginationSearchParamsParsers } from '~/types/search-params/pagination-search-params-cache'

type MissionTableData = Pick<
  InferResponseType<typeof client.api.missions.$get, 200>['missions'][number],
  'id' | 'name' | 'likeKeywords' | 'projectId'
> &
  Record<
    'projectName',
    InferResponseType<typeof client.api.missions.$get, 200>['missions'][number]['project']['name']
  > &
  Record<'operate', string> &
  Record<'projects', InferResponseType<typeof client.api.projects.$get, 200>['projects']>

const columnHelper = createColumnHelper<MissionTableData>()

const COLUMNS = [
  columnHelper.accessor('id', {
    header: 'ミッションID',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('name', {
    header: 'ミッション名',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('projectName', {
    header: 'プロジェクト名',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('operate', {
    header: '操作',
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <EditMissionModal
              id={row.original.id}
              name={row.original.name}
              likeKeywords={row.original.likeKeywords}
              projectId={row.original.projectId}
              projects={row.original.projects}
            />
            <MissionDeleteButton id={row.original.id} />
          </div>
        </div>
      )
    },
  }),
]

type MissionsTableProps = {
  data: InferResponseType<typeof client.api.missions.$get, 200>
  projects: InferResponseType<typeof client.api.projects.$get, 200>['projects']
}

export function MissionsTable({ data, projects }: MissionsTableProps) {
  const initialData: MissionTableData[] = data.missions.map((mission) => ({
    id: mission.id,
    name: mission.name,
    likeKeywords: mission.likeKeywords,
    projectId: mission.projectId,
    projectName: mission.project.name,
    operate: '',
    projects,
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
