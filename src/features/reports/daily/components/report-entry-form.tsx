import { IconMinus } from '@intentui/icons'
import type { Key } from 'react-aria-components'
import { Button } from '~/components/ui/intent-ui/button'
import { Checkbox } from '~/components/ui/intent-ui/checkbox'
import { ComboBox } from '~/components/ui/intent-ui/combo-box'
import { Textarea } from '~/components/ui/intent-ui/textarea'
import type {
  AppealCategoriesResponse,
  TroubleCategoriesResponse,
} from '~/features/reports/daily/types/api-response'
import type { AppealsAndTroublesEntry } from '~/features/reports/daily/types/search-params/input-count-search-params-cache'
import type { Kind } from './report-appeal-or-trouble-container'

type Item =
  | AppealCategoriesResponse['appealCategories'][number]
  | TroubleCategoriesResponse['troubleCategories'][number]

type ReportEntryFormProps = {
  entry: AppealsAndTroublesEntry
  index: number
  isExisting: boolean
  kind: Kind
  items: Item[]
  onChangeContent: (id: string, content: string) => void
  onChangeItem: (id: string, item: Key | null) => void
  onChangeResolved: (id: string, resolved: boolean) => void
  onRemove: (id: string) => void
}

export function ReportEntryForm({
  entry,
  index,
  isExisting,
  kind,
  items,
  onChangeContent,
  onChangeItem,
  onChangeResolved,
  onRemove,
}: ReportEntryFormProps) {
  const namePrefix = kind === 'appeal' ? 'appealEntries' : 'troubleEntries'

  return (
    <div className="mx-auto grid grid-cols-12 grid-rows-1 items-center gap-4 py-2">
      {/* Hidden inputs for form data structure */}
      <input type="hidden" name={`${namePrefix}[${index}].id`} value={entry.id} />

      <input type="hidden" name={`${namePrefix}[${index}].content`} value={entry.content || ''} />

      <input type="hidden" name={`${namePrefix}[${index}].categoryId`} value={entry.item || ''} />

      {kind === 'trouble' && (
        <input
          type="hidden"
          name={`${namePrefix}[${index}].resolved`}
          value={entry.resolved ? 'true' : 'false'}
        />
      )}

      <Textarea
        label="内容"
        placeholder="内容を入力"
        value={entry.content}
        onChange={(val) => onChangeContent(entry.id, val)}
        className="col-span-3"
      />

      <ComboBox
        label={kind === 'appeal' ? 'アピールポイント' : 'トラブルカテゴリー'}
        placeholder="カテゴリーを選択"
        selectedKey={entry.item ?? undefined}
        onSelectionChange={(key) => onChangeItem(entry.id, key)}
        className="col-span-2"
      >
        <ComboBox.Input />
        <ComboBox.List items={items}>
          {(item) => <ComboBox.Option id={item.id}>{item.name}</ComboBox.Option>}
        </ComboBox.List>
      </ComboBox>

      {kind === 'trouble' && isExisting ? (
        <Checkbox
          isSelected={entry.resolved ?? false}
          onChange={(checked) => onChangeResolved(entry.id, checked)}
          className="col-span-1 mt-6"
        >
          解決済み
        </Checkbox>
      ) : (
        <Button
          size="square-petite"
          intent="danger"
          onPress={() => onRemove(entry.id)}
          className="col-span-1 mt-6 rounded-full"
        >
          <IconMinus />
        </Button>
      )}
    </div>
  )
}
