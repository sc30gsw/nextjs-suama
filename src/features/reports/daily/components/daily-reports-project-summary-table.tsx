'use client'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { InferResponseType } from 'hono'
import { Note } from '~/components/ui/intent-ui/note'
import { Table } from '~/components/ui/intent-ui/table'
import type { client } from '~/lib/rpc'
import { dateUtils } from '~/utils/date-utils'

type ProjectSummary = InferResponseType<
  typeof client.api.dailies.summary.$get,
  200
>['summaries'][number]

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

export function DailyReportsProjectSummaryTable({
  summaries,
}: Record<'summaries', ProjectSummary[]>) {
  const table = useReactTable({
    data: summaries,
    columns: COLUMNS,
    getCoreRowModel: getCoreRowModel(),
  })

  const rows = table.getRowModel().rows

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
        {rows.length === 0 ? (
          <Table.Row>
            <Table.Cell colSpan={table.getHeaderGroups()[0]?.headers.length ?? 1}>
              <Note intent="info">
                <p>条件に合致する集計結果は見つかりませんでした。</p>
                <p className="mt-1">
                  フィルター条件や期間を変更するか、日報対象のプロジェクトを含めて
                  <br />
                  登録してください。
                </p>
              </Note>
            </Table.Cell>
          </Table.Row>
        ) : (
          rows.map((row) => (
            <Table.Row key={row.original.projectId}>
              {row.getVisibleCells().map((cell) => (
                <Table.Cell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Cell>
              ))}
            </Table.Row>
          ))
        )}
      </Table.Body>
    </Table>
  )
}
