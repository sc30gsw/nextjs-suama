'use client'

import { IconFileUpload } from '@tabler/icons-react'
import { buttonStyles } from '~/components/ui/intent-ui/button'
// import { FileTrigger } from '~/components/ui/intent-ui/file-trigger'
import { Tooltip } from '~/components/ui/intent-ui/tooltip'

export function CsvUploader() {
  return (
    <Tooltip delay={0}>
      <Tooltip.Trigger className={buttonStyles({ isDisabled: true })}>
        {/* <FileTrigger
          intent="primary"
          // TODO: ここでファイルを選択したときの処理を実装する
          onSelect={(e) => {
            const files = Array.from(e ?? [])
            const filenames = files.map((file) => file.name)
            setFile(filenames)
          }}
        >
          CSVアップロード
        </FileTrigger> */}
        <IconFileUpload className="size-4" />
        CSVアップロード
      </Tooltip.Trigger>
      <Tooltip.Content>この機能は現在開発中です。</Tooltip.Content>
    </Tooltip>
  )
}
