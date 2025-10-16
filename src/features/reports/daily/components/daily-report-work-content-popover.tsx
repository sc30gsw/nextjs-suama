import { IconFileText } from '@intentui/icons'
import { buttonStyles } from '~/components/ui/intent-ui/button'
import { Dialog } from '~/components/ui/intent-ui/dialog'
import { GridList } from '~/components/ui/intent-ui/grid-list'
import { Popover } from '~/components/ui/intent-ui/popover'
import type { WorkContentResponse } from '~/features/reports/daily/types/api-response'

type DailyReportWorkContentPopoverProps = {
  contents: WorkContentResponse[]
}

export function DailyReportWorkContentPopover({ contents }: DailyReportWorkContentPopoverProps) {
  return (
    <Popover>
      <Popover.Trigger aria-label="職務内容を表示" className={buttonStyles({ size: 'sm' })}>
        職務内容
        <IconFileText />
      </Popover.Trigger>

      <Popover.Content className="sm:min-w-96">
        <Dialog role="dialog" aria-label="職務内容">
          <Popover.Header className="sm:p-4">
            <Popover.Title level={2} className="sm:text-lg sm:leading-none">
              職務内容
            </Popover.Title>
            <Popover.Description>この日の仕事の内容を確認できます。</Popover.Description>
          </Popover.Header>

          <Popover.Body className="max-h-72 overflow-y-auto sm:px-4 sm:pt-0">
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
          </Popover.Body>

          <Popover.Footer className="flex justify-end sm:p-4">
            <Popover.Close>閉じる</Popover.Close>
          </Popover.Footer>
        </Dialog>
      </Popover.Content>
    </Popover>
  )
}
