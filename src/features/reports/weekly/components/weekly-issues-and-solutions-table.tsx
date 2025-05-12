'use client'

import { Table } from '~/components/ui/intent-ui/table'

type WeeklyIssuesAndSolutionsTableProps = {
  data: {
    id: number
    name: string
    occupation: string
  }[]
}

export function WeeklyIssuesAndSolutionsTable({
  data,
}: WeeklyIssuesAndSolutionsTableProps) {
  return (
    <Table allowResize={true}>
      <Table.Header>
        <Table.Column isResizable={true} className="w-50">
          カテゴリー名
        </Table.Column>
        <Table.Column isRowHeader={true}>内容</Table.Column>
      </Table.Header>
      <Table.Body items={data}>
        {(item) => (
          <Table.Row id={item.id}>
            <Table.Cell>{item.name}</Table.Cell>
            <Table.Cell>{item.occupation}</Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  )
}
