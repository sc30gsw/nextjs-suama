'use client'

import { IconChevronLgDown } from '@intentui/icons'
import { useRef } from 'react'
import { useToggle } from 'react-use'
import { Button } from '~/components/ui/intent-ui/button'
import { Popover } from '~/components/ui/intent-ui/popover'
import { CsvDownloadButton } from '~/features/report-contexts/components/csv-download-button'
import { CsvUploader } from '~/features/report-contexts/components/csv-uploader'
import { cn } from '~/utils/classes'

export type ReportContextMenuLabel = 'クライアント' | 'プロジェクト' | 'ミッション' | 'カテゴリー'

type ReportContextMenuProps = {
  categoryType: 'trouble' | 'appeal'
  label: ReportContextMenuLabel
}

export function ReportContextMenu({ categoryType, label }: ReportContextMenuProps) {
  const [open, toggle] = useToggle(false)
  const triggerRef = useRef(null)

  return (
    <>
      <Button ref={triggerRef} onPress={toggle}>
        メニューを開く
        <IconChevronLgDown
          className={cn('transition-transform duration-300', open && 'rotate-180')}
        />
      </Button>
      <Popover.Content
        triggerRef={triggerRef}
        isOpen={open}
        onOpenChange={toggle}
        className="sm:min-w-96"
      >
        <Popover.Header>
          <Popover.Title>メニュー</Popover.Title>
          <Popover.Description>{label}に関する操作を行うことができます。</Popover.Description>
        </Popover.Header>
        <Popover.Body>
          <div className="flex flex-col gap-6 py-2">
            <CsvUploader label={label} categoryType={categoryType} onClose={toggle} />
            <CsvDownloadButton label={label} categoryType={categoryType} onClose={toggle} />
          </div>
        </Popover.Body>
        <Popover.Footer className="mt-2">
          <Popover.Close onPress={toggle} className="w-full">
            閉じる
          </Popover.Close>
        </Popover.Footer>
      </Popover.Content>
    </>
  )
}
