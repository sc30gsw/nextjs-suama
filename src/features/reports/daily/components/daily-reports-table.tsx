'use client'

import { IconDocumentEdit, IconFileText, IconTrashEmpty } from '@intentui/icons'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { InferResponseType } from 'hono'
import Link from 'next/link'
import { useQueryStates } from 'nuqs'
import { Button } from '~/components/ui/intent-ui/button'
import { Table } from '~/components/ui/intent-ui/table'
import { DailyReportWorkContentPopover } from '~/features/reports/daily/components/daily-report-work-content-popover'
import type { client } from '~/lib/rpc'
import { paginationSearchParamsParsers } from '~/types/search-params/pagination-search-params-cache'

type DailyReportUser = InferResponseType<typeof client.api.dailies.today.$get, 200>['users'][number]

type DailyReportForToday = DailyReportUser & {
  operate: string
}

const columnHelper = createColumnHelper<DailyReportForToday>()

type DailyReportsTableProps<T extends 'today' | 'mine'> = {
  reports: InferResponseType<(typeof client.api.dailies)[T]['$get'], 200>
  userId: DailyReportUser['id']
}

export function DailyReportsTable<T extends 'today' | 'mine'>({
  reports,
  userId,
}: DailyReportsTableProps<T>) {
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
      cell: (info) => `${info.getValue()} / 5`,
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
    columnHelper.accessor('operate', {
      header: '操作',
      cell: ({ row }) => {
        const report = row.original
        const isCurrentUser = report.userId === userId

        return (
          <div className="flex items-center gap-2">
            <DailyReportWorkContentPopover contents={report.workContents}>
              <Button size="small">
                職務内容
                <IconFileText />
              </Button>
            </DailyReportWorkContentPopover>
            {isCurrentUser && (
              <div className="flex gap-2">
                <Link href={`/daily/edit/${report.id}`}>
                  <Button intent="outline" size="small">
                    修正
                    <IconDocumentEdit />
                  </Button>
                </Link>
                <Button intent="danger" size="small">
                  削除
                  <IconTrashEmpty />
                </Button>
              </div>
            )}
          </div>
        )
      },
    }),
  ]

  const initialData: DailyReportForToday[] = reports.users.map((user: DailyReportUser) => ({
    ...user,
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
    pageCount: Math.ceil(reports.total / rowsPerPage),
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
