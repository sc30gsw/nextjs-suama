'use client'

import { IconDocumentEdit } from '@intentui/icons'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { InferResponseType } from 'hono'
import Link from 'next/link'
import { Button } from '~/components/ui/intent-ui/button'
import { Table } from '~/components/ui/intent-ui/table'
import { DailyReportDeleteButton } from '~/features/reports/daily/components/daily-report-delete-button'
import { DailyReportWorkContentPopover } from '~/features/reports/daily/components/daily-report-work-content-popover'
import type { client } from '~/lib/rpc'

type DailyReport = InferResponseType<typeof client.api.dailies.$get, 200>['dailyReports'][number]

const columnHelper = createColumnHelper<DailyReport>()

type DailyReportsTableProps = {
  reports: DailyReport[]
  userId?: DailyReport['userId']
}

export function DailyReportsTable({ reports, userId }: DailyReportsTableProps) {
  const COLUMNS = [
    columnHelper.accessor('date', {
      header: '日付',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('username', {
      header: 'ユーザー名',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('totalHour', {
      header: '合計時間',
      cell: (info) => `${info.getValue()} 時間`,
    }),
    columnHelper.accessor('impression', {
      header: '所感',
      cell: (info) => `${info.getValue()}`,
    }),
    columnHelper.accessor('isRemote', {
      header: 'リモート勤務',
      cell: ({ row }) => {
        return row.original.isRemote ? 'リモート' : '出社'
      },
    }),
    columnHelper.accessor('isTurnedIn', {
      header: '提出',
      cell: ({ row }) => {
        return row.original.isTurnedIn ? '提出済み' : '下書き'
      },
    }),
    columnHelper.display({
      id: 'operate',
      header: '操作',
      cell: ({ row }) => {
        const report = row.original

        // 現在のログインユーザーの日報のみ編集・削除ボタンを表示
        const isCurrentUser = userId && report.userId === userId

        return (
          <div className="flex items-center gap-2">
            <DailyReportWorkContentPopover contents={report.workContents} />

            {isCurrentUser && (
              <div className="flex gap-2">
                <Link href={`/daily/edit/${report.id}`}>
                  <Button intent="outline" size="sm">
                    修正
                    <IconDocumentEdit />
                  </Button>
                </Link>

                <DailyReportDeleteButton id={report.id} />
              </div>
            )}
          </div>
        )
      },
    }),
  ]

  const table = useReactTable({
    data: reports,
    columns: COLUMNS,
    getCoreRowModel: getCoreRowModel(),
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
