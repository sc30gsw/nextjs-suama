'use client'

import { IconDocumentEdit, IconFileText, IconSend3, IconTrashEmpty } from '@intentui/icons'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { InferResponseType } from 'hono'
import Link from 'next/link'
import { useQueryStates } from 'nuqs'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/intent-ui/button'
import { Table } from '~/components/ui/intent-ui/table'
import { publishDraftAction } from '~/features/reports/daily/actions/publish-draft-action'
import { DailyReportWorkContentPopover } from '~/features/reports/daily/components/daily-report-work-content-popover'
import type { client } from '~/lib/rpc'
import { paginationSearchParamsParsers } from '~/types/search-params/pagination-search-params-cache'

type DailyReportForToday = {
  id: string
  date: string
  username: string
  totalHour: number
  impression: string
  isRemote: boolean
  isTurnedIn: boolean
  operate: string
  workContents: {
    id: string
    project: string
    mission: string
    workTime: number
    workContent: string
  }[]
}

const columnHelper = createColumnHelper<DailyReportForToday>()

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
    cell: ({ row, table }) => {
      const report = row.original
      // TODO: ここで実際のユーザー情報を取得して、現在のユーザーと比較するロジックを実装する
      const isCurrentUser = report.isRemote
      const tableProps = table.options.meta as {
        handlePublish: (id: string) => void
        isPending: boolean
      }

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
              {!report.isTurnedIn && (
                <Button
                  intent="primary"
                  size="small"
                  onPress={() => tableProps.handlePublish(report.id)}
                  isDisabled={tableProps.isPending}
                >
                  公開
                  <IconSend3 />
                </Button>
              )}
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

type DailyReportsTableProps<T extends 'today' | 'mine'> = {
  // TODO: 適切な型に修正（API側の修正でできるかも）
  reports: InferResponseType<(typeof client.api.dailies)[T]['$get'], 200>
}

export function DailyReportsTable<T extends 'today' | 'mine'>({
  reports,
}: DailyReportsTableProps<T>) {
  const [isPending, startTransition] = useTransition()

  const initialData: DailyReportForToday[] = reports.users.map((user: any) => ({
    id: user.id,
    date: user.date,
    username: user.username,
    totalHour: user.totalHour,
    impression: user.impression,
    isRemote: user.isRemote,
    isTurnedIn: user.isTurnedIn,
    operate: '',
    workContents: user.workContents || [],
  }))

  const handlePublish = (reportId: string) => {
    startTransition(async () => {
      try {
        await publishDraftAction(reportId)
        toast.success('日報を公開しました')
      } catch (error) {
        console.error('公開エラー:', error)
        toast.error('公開に失敗しました')
      }
    })
  }

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
    meta: {
      handlePublish,
      isPending,
    },
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
