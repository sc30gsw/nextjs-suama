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
import { buttonStyles } from '~/components/ui/intent-ui/button'
import { Note } from '~/components/ui/intent-ui/note'
import { Table } from '~/components/ui/intent-ui/table'
import { Tooltip } from '~/components/ui/intent-ui/tooltip'
import { DailyReportDeleteButton } from '~/features/reports/daily/components/daily-report-delete-button'
import { DailyReportWorkContentPopover } from '~/features/reports/daily/components/daily-report-work-content-popover'
import type { client } from '~/lib/rpc'
import { urls } from '~/lib/urls'

type DailyReport = InferResponseType<typeof client.api.dailies.$get, 200>['dailyReports'][number]

const columnHelper = createColumnHelper<DailyReport>()

type DailyReportsTableProps = {
  reports: DailyReport[]
  userId: DailyReport['userId']
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
      cell: (info) => {
        const impression = info.getValue()

        return (
          <Tooltip delay={0}>
            <Tooltip.Trigger className="line-clamp-1 max-w-xs cursor-default text-left">
              {impression}
            </Tooltip.Trigger>
            <Tooltip.Content className="wrap-break-word max-w-md whitespace-normal">
              {impression}
            </Tooltip.Content>
          </Tooltip>
        )
      },
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

        const isCurrentUser = report.userId === userId

        return (
          <div className="flex items-center gap-2">
            <DailyReportWorkContentPopover contents={report.workContents} />

            {isCurrentUser && (
              <div className="flex gap-2">
                <Tooltip delay={0}>
                  <Link href={urls.href({ route: '/daily/edit/[id]', params: { id: report.id } })}>
                    <Tooltip.Trigger className={buttonStyles({ size: 'sm' })}>
                      <IconDocumentEdit />
                    </Tooltip.Trigger>
                  </Link>
                  <Tooltip.Content>編集</Tooltip.Content>
                </Tooltip>
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

  const rows = table.getRowModel().rows

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
        {rows.length === 0 ? (
          <Table.Row>
            <Table.Cell colSpan={table.getHeaderGroups()[0]?.headers.length ?? 1}>
              <Note intent="info">
                <p>条件に合致する日報は見つかりませんでした。</p>
                <p className="mt-1">
                  フィルター条件や期間を変更するか、新しく日報を登録してください。
                </p>
              </Note>
            </Table.Cell>
          </Table.Row>
        ) : (
          rows.map((row) => (
            <Table.Row key={row.original.id}>
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
