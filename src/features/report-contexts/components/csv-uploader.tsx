'use client'

import { FileTrigger } from '~/components/ui/intent-ui/file-trigger'

export function CsvUploader() {
  return (
    <FileTrigger
      intent="primary"
      // TODO: ここでファイルを選択したときの処理を実装する
      // onSelect={(e) => {
      //   const files = Array.from(e ?? [])
      //   const filenames = files.map((file) => file.name)
      //   setFile(filenames)
      // }}
    >
      CSVアップロード
    </FileTrigger>
  )
}
