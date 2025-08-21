import { getCollectionProps, getFormProps, getInputProps, useInputControl } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { IconDocumentEdit, IconTriangleExclamation } from '@intentui/icons'
import type { InferResponseType } from 'hono'
import { useActionState, useState } from 'react'
import type { Key } from 'react-stately'
import { useToggle } from 'react-use'
import { toast } from 'sonner'
import { Button } from '~/components/ui/intent-ui/button'
import { Checkbox } from '~/components/ui/intent-ui/checkbox'
import { ComboBox } from '~/components/ui/intent-ui/combo-box'
import { Form } from '~/components/ui/intent-ui/form'
import { Loader } from '~/components/ui/intent-ui/loader'
import { Modal } from '~/components/ui/intent-ui/modal'
import { TextField } from '~/components/ui/intent-ui/text-field'
import { updateProjectAction } from '~/features/report-contexts/projects/actions/update-project-action'
import {
  type EditProjectInputSchema,
  editProjectInputSchema,
} from '~/features/report-contexts/projects/types/schemas/edit-project-input-schema'
import { useSafeForm } from '~/hooks/use-safe-form'
import type { client } from '~/lib/rpc'
import { withCallbacks } from '~/utils/with-callbacks'

type EditProjectModalProps = Pick<
  InferResponseType<typeof client.api.projects.$get, 200>['projects'][number],
  'id' | 'name' | 'likeKeywords' | 'clientId' | 'isArchived'
> &
  Record<'clients', InferResponseType<typeof client.api.clients.$get, 200>['clients']>

export function EditProjectModal({
  id,
  name,
  likeKeywords,
  clientId,
  isArchived,
  clients,
}: EditProjectModalProps) {
  const [open, toggle] = useToggle(false)
  const [client, setClient] = useState<Key | null>(clientId)
  const [checked, setChecked] = useState(isArchived)

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(updateProjectAction, {
      onSuccess(result) {
        toast.success('プロジェクトの更新に成功しました')
        toggle(false)
        setClient(result.initialValue?.clientId.toString() ?? '')
        setChecked(result.initialValue?.isArchive === 'on')
      },
      onError() {
        toast.error('プロジェクトの更新に失敗しました')
      },
    }),
    null,
  )

  const [form, fields] = useSafeForm<EditProjectInputSchema>({
    constraint: getZodConstraint(editProjectInputSchema),
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: editProjectInputSchema })
    },
    defaultValue: {
      id,
      name,
      likeKeywords,
      clientId,
      isArchive: isArchived ? 'on' : 'off',
    },
  })

  const clientIdInput = useInputControl(fields.clientId)

  const getError = () => {
    if (lastResult?.error && Array.isArray(lastResult.error.message)) {
      return lastResult.error.message.join(', ')
    }

    return
  }

  return (
    <Modal>
      <Button size="small" onPress={toggle}>
        編集
        <IconDocumentEdit />
      </Button>
      <Modal.Content isOpen={open} onOpenChange={toggle}>
        <Modal.Header>
          <Modal.Title>プロジェクトを編集する</Modal.Title>
          <Modal.Description>選択したプロジェクトの情報を編集します。</Modal.Description>
        </Modal.Header>
        <Form {...getFormProps(form)} action={action}>
          <Modal.Body className="space-y-4">
            {getError() && (
              <div className="mb-6 flex items-center gap-x-2 rounded-md bg-danger/15 p-3 text-danger text-sm">
                <IconTriangleExclamation className="size-4" />
                <p>{getError()}</p>
              </div>
            )}
            <input {...getInputProps(fields.id, { type: 'hidden' })} />
            <div>
              <TextField
                {...getInputProps(fields.name, { type: 'text' })}
                label="プロジェクト名"
                placeholder="プロジェクト名を入力"
                isRequired={true}
                autoFocus={true}
                isDisabled={isPending}
                defaultValue={lastResult?.initialValue?.name.toString() ?? name}
                errorMessage={''}
              />
              <span id={fields.name.errorId} className="text-red-500 text-sm">
                {fields.name.errors}
              </span>
            </div>
            <div>
              <TextField
                {...getInputProps(fields.likeKeywords, { type: 'text' })}
                label="検索単語"
                placeholder="検索単語を入力（例: apple,banana,orange）"
                isRequired={true}
                isDisabled={isPending}
                defaultValue={lastResult?.initialValue?.likeKeywords.toString() ?? likeKeywords}
                errorMessage={''}
              />
              <span id={fields.likeKeywords.errorId} className="break-words text-red-500 text-sm">
                {fields.likeKeywords.errors}
              </span>
            </div>
            <div>
              <ComboBox
                {...getInputProps(fields.clientId, { type: 'text' })}
                label="クライアント"
                placeholder="クライアントを選択"
                isDisabled={isPending}
                onSelectionChange={(key) => {
                  if (!key) {
                    return
                  }

                  setClient(key)
                  clientIdInput.change(key.toString())
                }}
                selectedKey={client}
                className="col-span-2"
              >
                <ComboBox.Input />
                <ComboBox.List items={clients}>
                  {(client) => <ComboBox.Option id={client.id}>{client.name}</ComboBox.Option>}
                </ComboBox.List>
              </ComboBox>
              <span id={fields.clientId.errorId} className="text-red-500 text-sm">
                {fields.clientId.errors}
              </span>
            </div>
            <div>
              {getCollectionProps(fields.isArchive, {
                type: 'checkbox',
                options: ['on'],
              }).map((props) => {
                const { key, ...rest } = props

                return (
                  <Checkbox
                    key={key}
                    {...rest}
                    name={fields.isArchive.name}
                    isSelected={checked}
                    onChange={(checked) => {
                      setChecked(checked)
                      form.update({
                        name: fields.isArchive.name,
                        value: checked ? 'on' : 'off',
                      })
                    }}
                    value={checked ? 'on' : 'off'}
                    isDisabled={isPending}
                    size="lg"
                    className="mt-2"
                  >
                    <span className="ml-2">アーカイブしますか？</span>
                  </Checkbox>
                )
              })}
              <span id={fields.isArchive.errorId} className="break-words text-red-500 text-sm">
                {fields.isArchive.errors}
              </span>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close isDisabled={isPending}>閉じる</Modal.Close>
            <Button type="submit" isDisabled={isPending}>
              {isPending ? '更新中...' : '更新する'}
              {isPending ? <Loader /> : <IconDocumentEdit />}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Content>
    </Modal>
  )
}
