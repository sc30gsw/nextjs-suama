import { IconTrashEmpty } from '@intentui/icons'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { buttonStyles } from '~/components/ui/intent-ui/button'
import { Loader } from '~/components/ui/intent-ui/loader'
import { Tooltip } from '~/components/ui/intent-ui/tooltip'
import { RELOAD_DELAY } from '~/constants'
import { ERROR_STATUS, TOAST_MESSAGES } from '~/constants/error-message'

import { deleteAppealCategoryAction } from '~/features/report-contexts/appeals/actions/delete-appeal-category-action'
import type { AppealCategoriesResponse } from '~/features/reports/daily/types/api-response'
import { Confirm } from '~/hooks/use-confirm'
import { isErrorStatus } from '~/utils'

type AppealCategoryDeleteButtonProps = Pick<
  AppealCategoriesResponse['appealCategories'][number],
  'id'
>

export function AppealCategoryDeleteButton({ id }: AppealCategoryDeleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = async () => {
    const ok = await Confirm.call({
      title: 'アピールポイントカテゴリーを削除しますか?',
      message: 'この操作は取り消せません。',
    })

    if (!ok) {
      return
    }

    startTransition(async () => {
      try {
        const result = await deleteAppealCategoryAction(id)

        if (result.status === 'error') {
          const errorMessage = result?.error?.message?.[0]

          if (isErrorStatus(errorMessage)) {
            switch (errorMessage) {
              case ERROR_STATUS.SOMETHING_WENT_WRONG:
                toast.error(TOAST_MESSAGES.APPEAL.DELETE_FAILED)

                return

              case ERROR_STATUS.UNAUTHORIZED:
                toast.error(TOAST_MESSAGES.AUTH.UNAUTHORIZED)

                return
            }
          }

          toast.error(TOAST_MESSAGES.APPEAL.DELETE_FAILED)

          return
        }

        toast.success(TOAST_MESSAGES.APPEAL.DELETE_SUCCESS)

        // ?: use cache が experimental で updateTag が効かないため、強制的にリロードする
        setTimeout(() => {
          window.location.reload()
        }, RELOAD_DELAY)
      } catch (_) {
        toast.error(TOAST_MESSAGES.APPEAL.DELETE_FAILED)
      }
    })
  }

  return (
    <Tooltip delay={0}>
      <Tooltip.Trigger
        className={buttonStyles({ size: 'sm', intent: 'danger' })}
        isDisabled={isPending}
        onPress={handleDelete}
      >
        {isPending ? <Loader /> : <IconTrashEmpty />}
      </Tooltip.Trigger>
      <Tooltip.Content>削除</Tooltip.Content>
    </Tooltip>
  )
}
