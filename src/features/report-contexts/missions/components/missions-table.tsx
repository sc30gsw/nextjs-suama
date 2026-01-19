'use client'

import { IconArchive, IconArchiveOff } from '@tabler/icons-react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useQueryStates } from 'nuqs'
import { Table } from '~/components/ui/intent-ui/table'
import { EditMissionModal } from '~/features/report-contexts/missions/components/edit-mission-modal'
import { MissionDeleteButton } from '~/features/report-contexts/missions/components/mission-delete-button'
import { MissionModel } from '~/features/report-contexts/missions/api/model'
import { ProjectModel } from '~/features/report-contexts/projects/api/model'
import { missionSearchParamsParsers } from '~/features/report-contexts/missions/types/search-params/mission-search-params-cache'
import { paginationSearchParamsParsers } from '~/types/search-params/pagination-search-params-cache'

type MissionTableData = Pick<
  MissionModel.getMissionsResponse['missions'][number],
  'id' | 'name' | 'likeKeywords' | 'projectId' | 'isArchived'
> &
  Record<'projectName', MissionModel.getMissionsResponse['missions'][number]['project']['name']> &
  Record<'operate', string> &
  Record<'projects', ProjectModel.getProjectsResponse['projects']>

const columnHelper = createColumnHelper<MissionTableData>()

const COLUMNS = [
  columnHelper.accessor('id', {
    header: 'ミッションID',
    cell: (info) => info.getValue(),
    enableSorting: false,
  }),
  columnHelper.accessor('name', {
    header: 'ミッション名',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('projectName', {
    id: 'projectName',
    header: 'プロジェクト名',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('isArchived', {
    id: 'status',
    header: 'プロジェクトアーカイブ',
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
            <EditMissionModal
              id={row.original.id}
              name={row.original.name}
              likeKeywords={row.original.likeKeywords}
              projectId={row.original.projectId}
              projects={row.original.projects}
            />
            <MissionDeleteButton id={row.original.id} name={row.original.name} />
          </div>
        </div>
      )
    },
  }),
]

type MissionsTableProps = {
  data: MissionModel.getMissionsResponse
  projects: ProjectModel.getProjectsResponse['projects']
}

export function MissionsTable({ data, projects }: MissionsTableProps) {
  const initialData: MissionTableData[] = data.missions.map((mission) => ({
    id: mission.id,
    name: mission.name,
    likeKeywords: mission.likeKeywords,
    isArchived: mission.isArchived,
    projectId: mission.projectId,
    projectName: mission.project.name,
    operate: '',
    projects,
  }))

  const [{ rowsPerPage, sortBy, sortOrder }, setQueryStates] = useQueryStates(
    {
      ...paginationSearchParamsParsers,
      ...missionSearchParamsParsers,
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
                : firstSort.id === 'projectName'
                  ? 'projectName'
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
