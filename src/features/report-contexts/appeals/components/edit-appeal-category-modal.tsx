import { getFormProps, getInputProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod/v4'
import { IconDocumentEdit, IconTriangleExclamation } from '@intentui/icons'
import { useRouter } from 'next/navigation'
import { useActionState } from 'react'
import { useToggle } from 'react-use'
import { toast } from 'sonner'
import { Button, buttonStyles } from '~/components/ui/intent-ui/button'
import { Form } from '~/components/ui/intent-ui/form'
import { Loader } from '~/components/ui/intent-ui/loader'
import { Modal } from '~/components/ui/intent-ui/modal'
import { TextField } from '~/components/ui/intent-ui/text-field'
import { Tooltip } from '~/components/ui/intent-ui/tooltip'
import { RELOAD_DELAY } from '~/constants'
import { ERROR_STATUS, TOAST_MESSAGES } from '~/constants/error-message'

import { updateAppealCategoryAction } from '~/features/report-contexts/appeals/actions/update-appeal-category-action'
import {
  type EditAppealCategoryInputSchema,
  editAppealCategoryInputSchema,
} from '~/features/report-contexts/appeals/types/schemas/edit-appeal-category-input-schema'
import type { AppealCategoriesResponse } from '~/features/reports/daily/types/api-response'
import { useSafeForm } from '~/hooks/use-safe-form'
import { isErrorStatus } from '~/utils'
import { withCallbacks } from '~/utils/with-callbacks'

type EditAppealCategoryModalProps = Pick<
  AppealCategoriesResponse['appealCategories'][number],
  'id' | 'name'
>

export function EditAppealCategoryModal({ id, name }: EditAppealCategoryModalProps) {
  const [open, toggle] = useToggle(false)
  const router = useRouter()

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(updateAppealCategoryAction, {
      onSuccess() {
        toast.success(TOAST_MESSAGES.APPEAL.UPDATE_SUCCESS)
        toggle(false)

        // ?: use cache が experimental で revalidateTag が効かないため、強制的にリロードする
        setTimeout(() => {
          window.location.reload()
        }, RELOAD_DELAY)
      },

      onError(result) {
        const errorMessage = result?.error?.message?.[0]

        if (isErrorStatus(errorMessage)) {
          switch (errorMessage) {
            case ERROR_STATUS.UNAUTHORIZED:
              toast.error(TOAST_MESSAGES.AUTH.UNAUTHORIZED, {
                cancel: {
                  label: 'ログイン',
                  onClick: () => router.push('/sign-in'),
                },
              })

              return

            case ERROR_STATUS.NOT_FOUND:
              toast.error(TOAST_MESSAGES.APPEAL.NOT_FOUND, {
                cancel: {
                  label: '一覧に戻る',
                  onClick: () => router.push('/appeal'),
                },
              })

              return
          }
        }

        toast.error(TOAST_MESSAGES.APPEAL.UPDATE_FAILED)
      },
    }),
    null,
  )

  const [form, fields] = useSafeForm<EditAppealCategoryInputSchema>({
    constraint: getZodConstraint(editAppealCategoryInputSchema),
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: editAppealCategoryInputSchema })
    },
    defaultValue: {
      id,
      name,
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
      <Tooltip delay={0}>
        <Tooltip.Trigger className={buttonStyles({ size: 'sm' })} onPress={toggle}>
          <IconDocumentEdit />
        </Tooltip.Trigger>
        <Tooltip.Content>編集</Tooltip.Content>
      </Tooltip>
      <Modal.Content isOpen={open} onOpenChange={toggle}>
        <Modal.Header>
          <Modal.Title>アピールポイントカテゴリーを編集する</Modal.Title>
          <Modal.Description>
            選択したアピールポイントのカテゴリーの情報を編集します。
          </Modal.Description>
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
                label="カテゴリー名"
                placeholder="カテゴリー名を入力"
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
