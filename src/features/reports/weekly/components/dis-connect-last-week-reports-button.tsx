'use client'

import { IconTrash } from '@intentui/icons'
import { useQueryStates } from 'nuqs'
import { Button } from '~/components/ui/intent-ui/button'
import { weeklyInputCountSearchParamsParsers } from '~/features/reports/weekly/types/search-params/weekly-input-count-search-params-cache'
import { Confirm } from '~/hooks/use-confirm'

export function DisConnectLastWeekReportsButton() {
  const [, setWeeklyReportEntry] = useQueryStates(weeklyInputCountSearchParamsParsers, {
    history: 'push',
    shallow: false,
  })

  const handleClick = async () => {
    const ok = await Confirm.call({
      title: '前週の予定の参照を解除しますか?',
      message: '実行すると、入力した内容は消え、再度、予定を入力し直す必要があります。',
    })

    if (!ok) {
      return
    }

    //? 参照をクリックし、値を編集してクエリパラメーターを操作後、参照解除しても値が残り続ける
    //? しかし、その後、再参照すると入力した内容が消え、前週の予定が表示される
    //? これは、create-weekly-report-formでデフォルト値が再設定されるため発生する
    //? 現状、再参照した際に、weeklyReportEntryのクエリパラメーターの保持がされず、デフォルト値で前週の予定と合流させることができないため、
    //? ここでは、値を初期化し、UXのつじつまを合わせる
    setWeeklyReportEntry({
      weeklyReportEntry: {
        count: 1,
        entries: [
          {
            id: crypto.randomUUID(),
            project: '',
            mission: '',
            hours: 0,
            content: '',
          },
        ],
      },
      isReference: false,
    })
  }

  return (
    <Button intent="outline" onPress={handleClick} className="w-fit">
      前週の予定の参照を解除する
      <IconTrash />
    </Button>
  )
}
