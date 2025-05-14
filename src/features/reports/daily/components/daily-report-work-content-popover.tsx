import type { ReactNode } from 'react'
import { GridList } from '~/components/ui/intent-ui/grid-list'
import { Popover } from '~/components/ui/intent-ui/popover'

type DailyReportWorkContentPopoverProps = {
  children: ReactNode
  // TODO: 適切な型に修正する
  contents: {
    id: string
    project: string
    mission: string
    workTime: number
    workContent: string
  }[]
}

export function DailyReportWorkContentPopover({
  children,
  contents,
}: DailyReportWorkContentPopoverProps) {
  return (
    <Popover>
      <Popover.Trigger aria-label="Open Popover">{children}</Popover.Trigger>
      <Popover.Content className="sm:min-w-96">
        <Popover.Header>
          <Popover.Title>職務内容</Popover.Title>
          <Popover.Description>
            この日の仕事の内容を確認できます。
          </Popover.Description>
        </Popover.Header>
        <Popover.Body>
          <div className="space-y-4">
            <GridList items={contents} className="min-w-64">
              {(item) => (
                <GridList.Item>
                  プロジェクト名: {item.project}
                  <br /> ミッション名: {item.mission}
                  <br />
                  所要時間: {item.workTime}時間 <br />
                  内容: {item.workContent}
                </GridList.Item>
              )}
            </GridList>
          </div>
        </Popover.Body>
        <Popover.Footer className="flex justify-end">
          <Popover.Close>閉じる</Popover.Close>
        </Popover.Footer>
      </Popover.Content>
    </Popover>
  )
}
