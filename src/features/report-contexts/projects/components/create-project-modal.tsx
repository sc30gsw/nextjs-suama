'use client'

import { getCollectionProps, getFormProps, getInputProps, useInputControl } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod/v4'
import { IconPlus, IconTriangleExclamation } from '@intentui/icons'
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
import { RELOAD_DELAY } from '~/constants'
import { ERROR_STATUS, getErrorMessage, TOAST_MESSAGES } from '~/constants/error-message'

import { createProjectAction } from '~/features/report-contexts/projects/actions/create-project-action'
import {
  type CreateProjectInputSchema,
  createProjectInputSchema,
} from '~/features/report-contexts/projects/types/schemas/create-project-input-schema'
import { useSafeForm } from '~/hooks/use-safe-form'
import type { client } from '~/lib/rpc'
import { isErrorStatus } from '~/utils'
import { withCallbacks } from '~/utils/with-callbacks'

type CreateProjectModalProps = {
  clients: InferResponseType<typeof client.api.clients.$get, 200>['clients']
}

export function CreateProjectModal({ clients }: CreateProjectModalProps) {
  const [open, toggle] = useToggle(false)
  // form resetがConformのものでは反映されないため
  const [client, setClient] = useState<Key | null>(null)
  const [checked, setChecked] = useState(false)

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(createProjectAction, {
      onSuccess() {
        toast.success(TOAST_MESSAGES.PROJECT.CREATE_SUCCESS)
        toggle(false)
        setClient(null)
        setChecked(false)

        // ?: use cache が experimental で updateTag が効かないため、強制的にリロードする
        setTimeout(() => {
          window.location.reload()
        }, RELOAD_DELAY)
      },

      onError(result) {
        const errorMessage = result?.error?.message?.[0]

        if (isErrorStatus(errorMessage)) {
          switch (errorMessage) {
            case ERROR_STATUS.UNAUTHORIZED:
              toast.error(TOAST_MESSAGES.AUTH.UNAUTHORIZED)

              return

            case ERROR_STATUS.INVALID_CLIENT_RELATION:
              toast.error(TOAST_MESSAGES.PROJECT.INVALID_RELATION)

              return
          }
        }

        toast.error(TOAST_MESSAGES.PROJECT.CREATE_FAILED)
      },
    }),
    null,
  )

  const [form, fields] = useSafeForm<CreateProjectInputSchema>({
    constraint: getZodConstraint(createProjectInputSchema),
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: createProjectInputSchema })
    },
    defaultValue: {
      name: '',
      likeKeywords: '',
      clientId: '',
      isArchive: 'off',
    },
  })

  const clientId = useInputControl(fields.clientId)

  const getError = () => {
    if (lastResult?.error && Array.isArray(lastResult.error.message)) {
      return lastResult.error.message.join(', ')
    }

    return
  }

  return (
    <Modal>
      <Button intent="outline" onPress={toggle}>
        プロジェクトを追加
        <IconPlus />
      </Button>
      <Modal.Content isOpen={open} onOpenChange={toggle}>
        <Modal.Header>
          <Modal.Title>プロジェクトを登録する</Modal.Title>
          <Modal.Description>日報作成で選択できるプロジェクトを登録します。</Modal.Description>
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
            <div>
              <TextField
                {...getInputProps(fields.name, { type: 'text' })}
                label="プロジェクト名"
                placeholder="プロジェクト名を入力"
                isRequired={true}
                autoFocus={true}
                isDisabled={isPending}
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
                errorMessage={''}
              />
              <span id={fields.likeKeywords.errorId} className="break-words text-red-500 text-sm">
                {fields.likeKeywords.errors}
              </span>
            </div>
            <div>
              {/* // TODO useInputControl を使用して不具合が発生する場合、useControl を使用してみてください。 */}
              {/* // ? https://ja.conform.guide/integration/ui-libraries */}
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
                  clientId.change(key.toString())
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
              {isPending ? '登録中...' : '登録する'}
              {isPending ? <Loader /> : <IconPlus />}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Content>
    </Modal>
  )
}
