import { IconTrashEmpty } from '@intentui/icons'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/intent-ui/button'
import { Loader } from '~/components/ui/intent-ui/loader'
import { TOAST_MESSAGES } from '~/constants/error-message'

import { deleteTroubleCategoryAction } from '~/features/report-contexts/troubles/actions/delete-trouble-category-action'
import type { TroubleCategoriesResponse } from '~/features/reports/daily/types/api-response'
import { Confirm } from '~/hooks/use-confirm'

type TroubleCategoryDeleteButtonProps = Pick<
  TroubleCategoriesResponse['troubleCategories'][number],
  'id'
>

export function TroubleCategoryDeleteButton({ id }: TroubleCategoryDeleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = async () => {
    const ok = await Confirm.call({
      title: '困っていることカテゴリーを削除しますか?',
      message: 'この操作は取り消せません。',
    })

    if (!ok) {
      return
    }

    startTransition(async () => {
      try {
        const result = await deleteTroubleCategoryAction(id)

        if (result.status === 'error') {
          toast.error(TOAST_MESSAGES.TROUBLE.DELETE_FAILED)
          return
        }

        toast.success(TOAST_MESSAGES.TROUBLE.DELETE_SUCCESS)
      } catch (_) {
        toast.error(TOAST_MESSAGES.TROUBLE.DELETE_FAILED)
      }
    })
  }

  return (
    <Button intent="danger" size="small" isDisabled={isPending} onPress={handleDelete}>
      削除
      {isPending ? <Loader /> : <IconTrashEmpty />}
    </Button>
  )
}
