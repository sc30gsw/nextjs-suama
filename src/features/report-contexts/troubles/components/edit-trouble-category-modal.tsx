import { getFormProps, getInputProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod/v4'
import { IconDocumentEdit, IconTriangleExclamation } from '@intentui/icons'
import { useRouter } from 'next/navigation'
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

import { updateTroubleCategoryAction } from '~/features/report-contexts/troubles/actions/update-trouble-category-action'
import {
  type EditTroubleCategoryInputSchema,
  editTroubleCategoryInputSchema,
} from '~/features/report-contexts/troubles/types/schemas/edit-trouble-category-input-schema'
import type { TroubleCategoriesResponse } from '~/features/reports/daily/types/api-response'
import { useSafeForm } from '~/hooks/use-safe-form'
import { urls } from '~/lib/urls'
import { isErrorStatus } from '~/utils'
import { withCallbacks } from '~/utils/with-callbacks'

type EditTroubleCategoryModalProps = Pick<
  TroubleCategoriesResponse['troubleCategories'][number],
  'id' | 'name'
>

export function EditTroubleCategoryModal({ id, name }: EditTroubleCategoryModalProps) {
  const [open, toggle] = useToggle(false)
  const router = useRouter()

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(updateTroubleCategoryAction, {
      onSuccess() {
        toast.success(TOAST_MESSAGES.TROUBLE.UPDATE_SUCCESS)
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
                  onClick: () => router.push(urls.href({ route: '/sign-in' })),
                },
              })

              return

            case ERROR_STATUS.NOT_FOUND:
              toast.error(TOAST_MESSAGES.TROUBLE.NOT_FOUND, {
                cancel: {
                  label: '一覧に戻る',
                  onClick: () => router.push(urls.href({ route: '/trouble/list' })),
                },
              })

              return
          }
        }

        toast.error(TOAST_MESSAGES.TROUBLE.UPDATE_FAILED)
      },
    }),
    null,
  )

  const [form, fields] = useSafeForm<EditTroubleCategoryInputSchema>({
    constraint: getZodConstraint(editTroubleCategoryInputSchema),
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: editTroubleCategoryInputSchema })
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
      <Button size="sm" onPress={toggle}>
        編集
        <IconDocumentEdit />
      </Button>
      <Modal.Content isOpen={open} onOpenChange={toggle}>
        <Modal.Header>
          <Modal.Title>困っていることカテゴリーを編集する</Modal.Title>
          <Modal.Description>
            選択した困っていることのカテゴリーの情報を編集します。
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
