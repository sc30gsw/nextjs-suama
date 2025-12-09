import { getCollectionProps, getFormProps, getInputProps, useInputControl } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod/v4'
import { IconDocumentEdit, IconTriangleExclamation } from '@intentui/icons'
import type { InferResponseType } from 'hono'
import { useRouter } from 'next/navigation'
import { useActionState, useState } from 'react'
import type { Key } from 'react-stately'
import { useToggle } from 'react-use'
import { toast } from 'sonner'
import { Button, buttonStyles } from '~/components/ui/intent-ui/button'
import { Checkbox } from '~/components/ui/intent-ui/checkbox'
import { ComboBox } from '~/components/ui/intent-ui/combo-box'
import { Form } from '~/components/ui/intent-ui/form'
import { Loader } from '~/components/ui/intent-ui/loader'
import { Modal } from '~/components/ui/intent-ui/modal'
import { TextField } from '~/components/ui/intent-ui/text-field'
import { Tooltip } from '~/components/ui/intent-ui/tooltip'
import { ERROR_STATUS, getErrorMessage, TOAST_MESSAGES } from '~/constants/error-message'
import { updateProjectAction } from '~/features/report-contexts/projects/actions/update-project-action'
import {
  type EditProjectInputSchema,
  editProjectInputSchema,
} from '~/features/report-contexts/projects/types/schemas/edit-project-input-schema'
import { matchesJapaneseFilter } from '~/features/reports/utils/japanese-filter'
import { useSafeForm } from '~/hooks/use-safe-form'
import type { client } from '~/lib/rpc'
import { urls } from '~/lib/urls'
import { isErrorStatus } from '~/utils'
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
  const [clientFilter, setClientFilter] = useState('')
  const [isClientFiltering, setIsClientFiltering] = useState(false)

  const router = useRouter()

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(updateProjectAction, {
      onSuccess(result) {
        toast.success(TOAST_MESSAGES.PROJECT.UPDATE_SUCCESS)
        toggle(false)
        setClient(result.initialValue?.clientId.toString() ?? '')
        setChecked(result.initialValue?.isArchived === 'on')
      },

      onError(result) {
        const errorMessage = result?.error?.message?.[0]

        if (isErrorStatus(errorMessage)) {
          switch (errorMessage) {
            case ERROR_STATUS.UNAUTHORIZED:
              toast.error(TOAST_MESSAGES.AUTH.UNAUTHORIZED, {
                cancel: {
                  label: 'ログイン',
                  onClick: () => router.push(urls.href({ route: '/sign-in' })),
                },
              })

              return

            case ERROR_STATUS.NOT_FOUND:
              toast.error(TOAST_MESSAGES.PROJECT.NOT_FOUND, {
                cancel: {
                  label: '一覧に戻る',
                  onClick: () => router.push(urls.href({ route: '/project/list' })),
                },
              })

              return

            case ERROR_STATUS.INVALID_CLIENT_RELATION:
              toast.error(TOAST_MESSAGES.CLIENT.INVALID_RELATION)

              return
          }
        }

        toast.error(TOAST_MESSAGES.PROJECT.UPDATE_FAILED)
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
      isArchived: isArchived ? 'on' : 'off',
    },
  })

  const clientIdInput = useInputControl(fields.clientId)
  const isArchivedInput = useInputControl(fields.isArchived)

  const clientInputValue =
    isClientFiltering || !client ? clientFilter : (clients.find((c) => c.id === client)?.name ?? '')

  const filteredClients = clients.filter((client) => {
    return matchesJapaneseFilter(client.name, clientFilter)
  })

  const getError = () => {
    if (lastResult?.error && Array.isArray(lastResult.error.message)) {
      return lastResult.error.message.join(', ')
    }

    return
  }

  return (
    <Modal>
      <Tooltip delay={0}>
        <Tooltip.Trigger className={buttonStyles({ size: 'sm' })} onPress={toggle}>
          <IconDocumentEdit />
        </Tooltip.Trigger>
        <Tooltip.Content>編集</Tooltip.Content>
      </Tooltip>
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
                <p>
                  {getErrorMessage('project', getError() as Parameters<typeof getErrorMessage>[1])}
                </p>
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
                defaultValue={
                  lastResult?.initialValue?.likeKeywords.toString() ?? likeKeywords ?? undefined
                }
                errorMessage={''}
              />
              <span
                id={fields.likeKeywords.errorId}
                className="wrap-break-words text-red-500 text-sm"
              >
                {fields.likeKeywords.errors}
              </span>
            </div>
            <div>
              {/* // TODO useInputControl を使用して不具合が発生する場合、useControl を使用してみてください。 */}
              {/* // ? https://ja.conform.guide/integration/ui-libraries */}
              <ComboBox
                {...(() => {
                  const props = getInputProps(fields.clientId, { type: 'text' }) as Record<
                    string,
                    unknown
                  >
                  const { inputValue: _, ...rest } = props

                  return rest
                })()}
                label="クライアント"
                placeholder="クライアントを選択"
                inputValue={clientInputValue}
                onInputChange={(value) => {
                  setClientFilter(value)
                  setIsClientFiltering(true)

                  if (client && value !== (clients.find((c) => c.id === client)?.name ?? '')) {
                    setClient(null)
                    clientIdInput.change('')
                  }
                }}
                isDisabled={isPending}
                onSelectionChange={(key) => {
                  if (!key) {
                    return
                  }

                  setClient(key)
                  clientIdInput.change(key.toString())

                  setClientFilter('')
                  setIsClientFiltering(false)
                }}
                defaultFilter={() => true}
                selectedKey={client}
                className="col-span-2"
              >
                <ComboBox.Input />
                <ComboBox.List items={filteredClients}>
                  {(client) => <ComboBox.Option id={client.id}>{client.name}</ComboBox.Option>}
                </ComboBox.List>
              </ComboBox>
              <span id={fields.clientId.errorId} className="text-red-500 text-sm">
                {fields.clientId.errors}
              </span>
            </div>
            <div>
              {getCollectionProps(fields.isArchived, {
                type: 'checkbox',
                options: ['on'],
              }).map((props) => {
                const { key, ...rest } = props

                return (
                  <Checkbox
                    key={key}
                    {...rest}
                    name={fields.isArchived.name}
                    isSelected={checked}
                    onChange={(newChecked: boolean) => {
                      setChecked(newChecked)

                      isArchivedInput.change(newChecked ? 'on' : 'off')
                    }}
                    isDisabled={isPending}
                    size="lg"
                    className="mt-2"
                  >
                    <span className="ml-2">アーカイブしますか？</span>
                  </Checkbox>
                )
              })}
              <span
                id={fields.isArchived.errorId}
                className="wrap-break-words text-red-500 text-sm"
              >
                {fields.isArchived.errors}
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
