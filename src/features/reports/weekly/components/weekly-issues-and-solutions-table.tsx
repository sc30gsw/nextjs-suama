import type { ReactNode } from 'react'
import { Table } from '~/components/ui/intent-ui/table'

export function WeeklyIssuesAndSolutionsTable({ children }: { children: ReactNode }) {
  return (
    <Table allowResize={true}>
      <Table.Header>
        <Table.Column isResizable={true} className="w-50">
          カテゴリー名
        </Table.Column>
        <Table.Column isRowHeader={true}>内容</Table.Column>
      </Table.Header>
      {children}
    </Table>
  )
}
