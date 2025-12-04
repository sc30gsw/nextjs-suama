'use client'

import { getFormProps, getInputProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod/v4'
import { IconPlus, IconTriangleExclamation } from '@intentui/icons'
import { useActionState } from 'react'
import { useToggle } from 'react-use'
import { toast } from 'sonner'
import { Button } from '~/components/ui/intent-ui/button'
import { Form } from '~/components/ui/intent-ui/form'
import { Loader } from '~/components/ui/intent-ui/loader'
import { Modal } from '~/components/ui/intent-ui/modal'
import { TextField } from '~/components/ui/intent-ui/text-field'
import { ERROR_STATUS, getErrorMessage, TOAST_MESSAGES } from '~/constants/error-message'

import { createClientAction } from '~/features/report-contexts/clients/actions/create-client-action'
import {
  type CreateClientInputSchema,
  createClientInputSchema,
} from '~/features/report-contexts/clients/types/schemas/create-client-input-schema'
import { useSafeForm } from '~/hooks/use-safe-form'
import { isErrorStatus } from '~/utils'
import { withCallbacks } from '~/utils/with-callbacks'

export function CreateClientModal() {
  const [open, toggle] = useToggle(false)

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(createClientAction, {
      onSuccess() {
        toast.success(TOAST_MESSAGES.CLIENT.CREATE_SUCCESS)
        toggle(false)
      },

      onError(result) {
        const errorMessage = result?.error?.message?.[0]

        if (isErrorStatus(errorMessage)) {
          switch (errorMessage) {
            case ERROR_STATUS.UNAUTHORIZED:
              toast.error(TOAST_MESSAGES.AUTH.UNAUTHORIZED)

              return
          }
        }

        toast.error(TOAST_MESSAGES.CLIENT.CREATE_FAILED)
      },
    }),
    null,
  )

  const [form, fields] = useSafeForm<CreateClientInputSchema>({
    constraint: getZodConstraint(createClientInputSchema),
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: createClientInputSchema })
    },
    defaultValue: {
      name: '',
      likeKeywords: '',
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
      <Button intent="outline" onPress={toggle}>
        クライアントを追加
        <IconPlus />
      </Button>
      <Modal.Content isOpen={open} onOpenChange={toggle}>
        <Modal.Header>
          <Modal.Title>クライアントを登録する</Modal.Title>
          <Modal.Description>プロジェクトに関連するクライアントを登録します。</Modal.Description>
        </Modal.Header>
        <Form {...getFormProps(form)} action={action}>
          <Modal.Body className="space-y-4">
            {getError() && (
              <div className="mb-6 flex items-center gap-x-2 rounded-md bg-danger/15 p-3 text-danger text-sm">
                <IconTriangleExclamation className="size-4" />
                <p>
                  {getErrorMessage('client', getError() as Parameters<typeof getErrorMessage>[1])}
                </p>
              </div>
            )}
            <div>
              <TextField
                {...getInputProps(fields.name, { type: 'text' })}
                label="クライアント名"
                placeholder="クライアント名を入力"
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
