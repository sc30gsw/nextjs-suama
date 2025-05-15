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
              {item.name}
            </Table.Cell>
            <Table.Cell className="break-words whitespace-normal ">
              {item.gender}
            </Table.Cell>
            <Table.Cell>{item.age}</Table.Cell>
            <Table.Cell className="break-words whitespace-normal ">
              {item.occupation}
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  )
}
