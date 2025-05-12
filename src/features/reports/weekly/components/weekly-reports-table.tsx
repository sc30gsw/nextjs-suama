'use client'

import { Table } from '~/components/ui/intent-ui/table'

type WeeklyReportsTableProps = {
  data: {
    id: number
    name: string
    gender: string
    age: number
    occupation: string
  }[]
}

export function WeeklyReportsTable({ data }: WeeklyReportsTableProps) {
  return (
    <Table allowResize={true}>
      <Table.Header>
        <Table.Column isRowHeader={true}>プロジェクト名</Table.Column>
        <Table.Column isRowHeader={true}>ミッション名</Table.Column>
        <Table.Column isResizable={true} className="max-w-20">
          時間数
        </Table.Column>
        <Table.Column>職務内容</Table.Column>
      </Table.Header>
      <Table.Body items={data}>
        {(item) => (
          <Table.Row id={item.id}>
            <Table.Cell>{item.name}</Table.Cell>
            <Table.Cell>{item.gender}</Table.Cell>
            <Table.Cell>{item.age}</Table.Cell>
            <Table.Cell>{item.occupation}</Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  )
}
