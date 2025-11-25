import { type FieldName, getInputProps, useField, useInputControl } from '@conform-to/react'
import { IconMinus } from '@intentui/icons'
import { useFormStatus } from 'react-dom'
import { buttonStyles } from '~/components/ui/intent-ui/button'
import { ComboBox } from '~/components/ui/intent-ui/combo-box'
import { Textarea } from '~/components/ui/intent-ui/textarea'
import { Tooltip } from '~/components/ui/intent-ui/tooltip'
import type { AppealCategoriesResponse } from '~/features/reports/daily/types/api-response'
import type { CreateDailyReportFormSchema } from '~/features/reports/daily/types/schemas/create-daily-report-form-schema'
import { cn } from '~/utils/classes'

type AppealEntrySchema = CreateDailyReportFormSchema['appealEntries'][number]

type AppealInputEntriesProps = {
  formId: string
  name: FieldName<AppealEntrySchema, CreateDailyReportFormSchema>
  categories: AppealCategoriesResponse['appealCategories']
  onRemove: () => void
  onChangeContent: (
    id: AppealEntrySchema['id'],
    content: Exclude<AppealEntrySchema['content'], undefined>,
  ) => void
  onChangeCategory: (
    id: AppealEntrySchema['id'],
    categoryId: Exclude<AppealEntrySchema['categoryId'], undefined>,
  ) => void
}

export function AppealInputEntries({
  formId,
  name,
  categories,
  onRemove,
  onChangeContent,
  onChangeCategory,
}: AppealInputEntriesProps) {
  const [meta] = useField(name, { formId })
  const field = meta.getFieldset()

  const contentInput = useInputControl(field.content)
  const categoryIdInput = useInputControl(field.categoryId)

  const { pending } = useFormStatus()

  const entryId = field.id.value ?? field.id.initialValue ?? ''

  return (
    <div className="mx-auto grid grid-cols-12 grid-rows-1 items-center gap-4 py-2">
      <input {...getInputProps(field.id, { type: 'hidden' })} />

      <div className="col-span-4">
        <Textarea
          {...getInputProps(field.content, { type: 'text' })}
          label="内容"
          placeholder="内容を入力"
          value={contentInput.value ?? ''}
          onChange={(val) => {
            contentInput.change(val)
            onChangeContent(entryId, val)
          }}
          isDisabled={pending}
        />
        <span id={field.content.errorId} className="text-red-500 text-sm">
          {field.content.errors}
        </span>
      </div>

      <div className="col-span-3">
        <ComboBox
          {...getInputProps(field.categoryId, { type: 'text' })}
          label="アピールカテゴリー"
          placeholder="カテゴリーを選択"
          selectedKey={categoryIdInput.value ?? undefined}
          onSelectionChange={(key) => {
            const value = key ? String(key) : undefined
            categoryIdInput.change(value)
            onChangeCategory(entryId, value ?? '')
          }}
          isDisabled={pending}
        >
          <ComboBox.Input />
          <ComboBox.List items={categories}>
            {(category) => <ComboBox.Option id={category.id}>{category.name}</ComboBox.Option>}
          </ComboBox.List>
        </ComboBox>
        <span id={field.categoryId.errorId} className="text-red-500 text-sm">
          {field.categoryId.errors}
        </span>
      </div>

      <div className="col-span-1">
        <Tooltip delay={0}>
          <Tooltip.Trigger
            className={cn(
              buttonStyles({ size: 'sq-sm', intent: 'danger', isCircle: true }),
              'mt-6',
            )}
            onPress={onRemove}
            isDisabled={pending}
          >
            <IconMinus />
          </Tooltip.Trigger>
          <Tooltip.Content>アピールポイントを削除</Tooltip.Content>
        </Tooltip>
      </div>
    </div>
  )
}
