'use client'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { InferResponseType } from 'hono'
import { Table } from '~/components/ui/intent-ui/table'
import type { client } from '~/lib/rpc'
import { dateUtils } from '~/utils/date-utils'

type ProjectSummary = InferResponseType<
  (typeof client.api.dailies.mine)['summary']['$get'],
  200
>['summary'][number]

const columnHelper = createColumnHelper<ProjectSummary>()

const COLUMNS = [
  columnHelper.accessor('projectName', {
    header: 'プロジェクト名',
  }),
  columnHelper.accessor(
    (row) => {
      if (!row.firstWorkDate || !row.lastWorkDate) {
        return '-'
      }
      return `${dateUtils.formatDateByJST(
        new Date(row.firstWorkDate),
      )} ~ ${dateUtils.formatDateByJST(new Date(row.lastWorkDate))}`
    },
    {
      id: 'period',
      header: '期間',
    },
  ),
  columnHelper.accessor('workDays', {
    header: '作業日数',
    cell: (info) => `${info.getValue()} 日`,
  }),
  columnHelper.accessor('totalHours', {
    header: '合計勤務時間',
    cell: (info) => `${info.getValue()} 時間`,
  }),
  columnHelper.accessor('averageHoursPerDay', {
    header: '平均作業時間',
    cell: (info) => `${info.getValue().toFixed(2)} 時間`,
  }),
]

export function ProjectSummaryTable({ summary }: Record<'summary', ProjectSummary[]>) {
  const table = useReactTable({
    data: summary,
    columns: COLUMNS,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Table aria-label="Project Summary">
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
          <Table.Row key={row.original.projectId}>
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
