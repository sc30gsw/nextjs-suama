'use client'

import { IconChevronLgDown, IconFileDownload } from '@intentui/icons'
import { useRef } from 'react'
import { useToggle } from 'react-use'
import { Button, buttonStyles } from '~/components/ui/intent-ui/button'
import { Popover } from '~/components/ui/intent-ui/popover'
import { Tooltip } from '~/components/ui/intent-ui/tooltip'
import { CsvUploader } from '~/features/report-contexts/components/csv-uploader'
import { cn } from '~/utils/classes'

export function ReportContextMenu({
  label,
}: Record<'label', 'クライアント' | 'プロジェクト' | 'ミッション' | 'カテゴリー'>) {
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
          <div className="flex flex-col gap-6">
            <CsvUploader />
            <Tooltip delay={0}>
              <Tooltip.Trigger className={buttonStyles({ isDisabled: true })}>
                <IconFileDownload />
                CSVダウンロード
              </Tooltip.Trigger>
              <Tooltip.Content>この機能は現在開発中です。</Tooltip.Content>
            </Tooltip>
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
