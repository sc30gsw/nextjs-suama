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
import { RELOAD_DELAY } from '~/constants'
import { ERROR_STATUS, getErrorMessage, TOAST_MESSAGES } from '~/constants/error-message'

import { createAppealCategoryAction } from '~/features/report-contexts/appeals/actions/create-appeal-category-action'
import {
  type CreateAppealCategoryInputSchema,
  createAppealCategoryInputSchema,
} from '~/features/report-contexts/appeals/types/schemas/create-appeal-category-input-schema'
import { useSafeForm } from '~/hooks/use-safe-form'
import { isErrorStatus } from '~/utils'
import { withCallbacks } from '~/utils/with-callbacks'

export function CreateAppealCategoryModal() {
  const [open, toggle] = useToggle(false)

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(createAppealCategoryAction, {
      onSuccess() {
        toast.success(TOAST_MESSAGES.APPEAL.CREATE_SUCCESS)
        toggle(false)

        // ? use cache が experimental で updateTag が効かないため、強制的にリロードする
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
          }
        }

        toast.error(TOAST_MESSAGES.APPEAL.CREATE_FAILED)
      },
    }),
    null,
  )

  const [form, fields] = useSafeForm<CreateAppealCategoryInputSchema>({
    constraint: getZodConstraint(createAppealCategoryInputSchema),
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: createAppealCategoryInputSchema,
      })
    },
    defaultValue: {
      name: '',
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
        カテゴリーを追加
        <IconPlus />
      </Button>
      <Modal.Content isOpen={open} onOpenChange={toggle}>
        <Modal.Header>
          <Modal.Title>アピールポイントカテゴリーを登録する</Modal.Title>
          <Modal.Description>
            日報作成で選択できるアピールポイントのカテゴリーを登録します。
          </Modal.Description>
        </Modal.Header>
        <Form {...getFormProps(form)} action={action}>
          <Modal.Body className="space-y-4">
            {getError() && (
              <div className="mb-6 flex items-center gap-x-2 rounded-md bg-danger/15 p-3 text-danger text-sm">
                <IconTriangleExclamation className="size-4" />
                <p>
                  {getErrorMessage('common', getError() as Parameters<typeof getErrorMessage>[1])}
                </p>
              </div>
            )}
            <div>
              <TextField
                {...getInputProps(fields.name, { type: 'text' })}
                label="カテゴリー名"
                placeholder="カテゴリー名を入力"
                isRequired={true}
                autoFocus={true}
                isDisabled={isPending}
                errorMessage={''}
              />
              <span id={fields.name.errorId} className="text-red-500 text-sm">
                {fields.name.errors}
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
