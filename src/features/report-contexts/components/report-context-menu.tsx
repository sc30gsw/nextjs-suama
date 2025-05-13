'use client'

import { IconChevronLgDown, IconFileDownload } from '@intentui/icons'
import { useRef } from 'react'
import { useToggle } from 'react-use'
import { Button } from '~/components/ui/intent-ui/button'
import { Popover } from '~/components/ui/intent-ui/popover'
import { CsvUploader } from '~/features/report-contexts/components/csv-uploader'
import { cn } from '~/utils/classes'

type ReportContextMenuProps = {
  label: 'クライアント' | 'プロジェクト' | 'ミッション' | 'カテゴリー'
}

export function ReportContextMenu({ label }: ReportContextMenuProps) {
  const [isOpen, toggle] = useToggle(false)
  const triggerRef = useRef(null)

  return (
    <Popover onOpenChange={toggle}>
      <Button ref={triggerRef}>
        メニューを開く
        <IconChevronLgDown
          className={cn(
            'transition-transform duration-300',
            isOpen && 'rotate-180',
          )}
        />
      </Button>
      <Popover.Content className="sm:min-w-96">
        <Popover.Header>
          <Popover.Title>メニュー</Popover.Title>
          <Popover.Description>
            {label}に関する操作を行うことができます。
          </Popover.Description>
        </Popover.Header>
        <Popover.Body>
          <div className="flex flex-col gap-6">
            <CsvUploader />
            <Button>
              <IconFileDownload />
              CSVダウンロード
            </Button>
          </div>
        </Popover.Body>
        <Popover.Footer className="mt-2">
          <Popover.Close className="w-full">閉じる</Popover.Close>
        </Popover.Footer>
      </Popover.Content>
    </Popover>
  )
}
