'use client'
import { IconDocumentEdit, IconFileText, IconTrashEmpty } from '@intentui/icons'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { InferResponseType } from 'hono'
import { useQueryStates } from 'nuqs'
import { Button } from '~/components/ui/intent-ui/button'
import { Table } from '~/components/ui/intent-ui/table'
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
    cell: ({ row }) => {
      const report = row.original
      // TODO: ここで実際のユーザー情報を取得して、現在のユーザーと比較するロジックを実装する
      const isCurrentUser = report.isRemote

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
              <Button intent="outline" size="small">
                修正
                <IconDocumentEdit />
              </Button>
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

type DailyReportsTableForTodayProps = {
  // TODO: 適切な型に修正（API側の修正でできるかも）
  reports: InferResponseType<typeof client.api.dailies.today.$get, 200>
}

export function DailyReportsTableForToday({
  reports,
}: DailyReportsTableForTodayProps) {
  const initialData: DailyReportForToday[] = reports.users.map((user) => ({
    id: user.id.toString(),
    date: user.birthDate,
    username: user.username,
    totalHour: user.age,
    impression: user.email,
    isRemote: user.role === 'admin',
    isTurnedIn: user.role === 'moderator',
    operate: '',
    workContents: Array.from({ length: 5 }, (_, i) => ({
      id: `${user.id}-${i}`,
      project: `プロジェクト${i + 1}`,
      mission: `ミッション${i + 1}`,
      workTime: Number((Math.random() * 3 + 1).toFixed(1)),
      workContent: `作業内容のダミー${i + 1}`,
    })),
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
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </Table.Column>
            ))}
          </Table.Row>
        ))}
      </Table.Header>
      <Table.Body>
        {table.getRowModel().rows.map((row) => (
          <Table.Row key={row.id}>
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
