'use client'

import type { InferResponseType } from 'hono'
import { Table } from '~/components/ui/intent-ui/table'
import type { client } from '~/lib/rpc'

type DailyReportsInWeeklyReportListTableProps = {
  data: InferResponseType<
    typeof client.api.weeklies.$get,
    200
  >['reports'][number]['dailyReports'][number]['dailyReportMissions']
}

export function DailyReportsInWeeklyReportListTable({
  data,
}: DailyReportsInWeeklyReportListTableProps) {
  return (
    <Table allowResize={true} className="table-fixed w-full">
      <Table.Header>
        <Table.Column isRowHeader={true} isResizable={true} className="w-md">
          プロジェクト名
        </Table.Column>
        <Table.Column isRowHeader={true} isResizable={true}>
          ミッション名
        </Table.Column>
        <Table.Column className="max-w-20" isResizable={true}>
          時間数
        </Table.Column>
        <Table.Column className="w-md">職務内容</Table.Column>
      </Table.Header>
      <Table.Body items={data}>
        {(item) => (
          <Table.Row id={item.id}>
            <Table.Cell className="break-words whitespace-normal ">
              {item.mission.project.name}
            </Table.Cell>
            <Table.Cell className="break-words whitespace-normal ">
              {item.mission.name}
            </Table.Cell>
            <Table.Cell>{item.hours ? item.hours.toFixed(1) : 0}</Table.Cell>
            <Table.Cell className="break-words whitespace-normal ">
              {item.workContent}
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  )
}
