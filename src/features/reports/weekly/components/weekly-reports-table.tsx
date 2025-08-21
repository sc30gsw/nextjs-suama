'use client'

import type { InferResponseType } from 'hono'
import { Table } from '~/components/ui/intent-ui/table'
import type { client } from '~/lib/rpc'

type WeeklyReportsTableProps<Key extends 'lastWeekReports' | 'nextWeekReports'> = {
  data: InferResponseType<
    typeof client.api.weeklies.$get,
    200
  >['reports'][number][Key][number]['weeklyReportMissions']
}

export function WeeklyReportsTable<Key extends 'lastWeekReports' | 'nextWeekReports'>({
  data,
}: WeeklyReportsTableProps<Key>) {
  return (
    <Table allowResize={true} className="w-full table-fixed">
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
            <Table.Cell className="whitespace-normal break-words ">
              {item.mission.project.name}
            </Table.Cell>
            <Table.Cell className="whitespace-normal break-words ">{item.mission.name}</Table.Cell>
            <Table.Cell>{item.hours.toFixed(1)}</Table.Cell>
            <Table.Cell className="whitespace-normal break-words ">{item.workContent}</Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  )
}
