'use client'

import { getFormProps, getInputProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { IconDocumentEdit, IconTriangleExclamation } from '@intentui/icons'
import type { InferResponseType } from 'hono'
import { useActionState } from 'react'
import { useToggle } from 'react-use'
import { toast } from 'sonner'
import { Button } from '~/components/ui/intent-ui/button'
import { Form } from '~/components/ui/intent-ui/form'
import { Loader } from '~/components/ui/intent-ui/loader'
import { Modal } from '~/components/ui/intent-ui/modal'
import { TextField } from '~/components/ui/intent-ui/text-field'
import { updateClientAction } from '~/features/report-contexts/clients/actions/update-client-action'
import { editClientInputSchema } from '~/features/report-contexts/clients/types/schemas/edit-client-input-schema'
import { useSafeForm } from '~/hooks/use-safe-form'
import type { client } from '~/lib/rpc'
import { withCallbacks } from '~/utils/with-callbacks'

type EditClientModalProps = Pick<
  InferResponseType<typeof client.api.clients.$get, 200>['clients'][number],
  'id' | 'name' | 'likeKeywords'
>

export function EditClientModal({
  id,
  name,
  likeKeywords,
}: EditClientModalProps) {
  const [open, toggle] = useToggle(false)

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(updateClientAction, {
      onSuccess() {
        toast.success('クライアントの更新に成功しました')
        toggle(false)
      },
      onError() {
        toast.error('クライアントの更新に失敗しました')
      },
    }),
    null,
  )

  const [form, fields] = useSafeForm<EditClientModalProps>({
    constraint: getZodConstraint(editClientInputSchema),
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: editClientInputSchema })
    },
    defaultValue: {
      id,
      name,
      likeKeywords,
    },
  })

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
          <Modal.Title>クライアントを編集する</Modal.Title>
          <Modal.Description>
            選択したクライアントの情報を編集します。
          </Modal.Description>
        </Modal.Header>
        <Form {...getFormProps(form)} action={action}>
          <Modal.Body className="space-y-4">
            {getError() && (
              <div className="bg-danger/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-danger mb-6">
                <IconTriangleExclamation className="size-4" />
                <p>{getError()}</p>
              </div>
            )}
            <input {...getInputProps(fields.id, { type: 'hidden' })} />
            <div>
              <TextField
                {...getInputProps(fields.name, { type: 'text' })}
                label="クライアント名"
                placeholder="クライアント名を入力"
                isRequired={true}
                autoFocus={true}
                isDisabled={isPending}
                defaultValue={lastResult?.initialValue?.name.toString() ?? name}
                errorMessage={''}
              />
              <span id={fields.name.errorId} className="text-sm text-red-500">
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
                  lastResult?.initialValue?.likeKeywords.toString() ??
                  likeKeywords
                }
                errorMessage={''}
              />
              <span
                id={fields.likeKeywords.errorId}
                className="text-sm text-red-500 break-words"
              >
                {fields.likeKeywords.errors}
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
