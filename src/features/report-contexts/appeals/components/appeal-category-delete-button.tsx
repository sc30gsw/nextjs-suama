import { IconTrashEmpty } from '@intentui/icons'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/intent-ui/button'
import { Loader } from '~/components/ui/intent-ui/loader'
import { deleteAppealCategoryAction } from '~/features/report-contexts/appeals/actions/delete-appeal-category-action'
import type { AppealCategoriesResponse } from '~/features/reports/daily/types/api-response'
import { Confirm } from '~/hooks/use-confirm'

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
          toast.error('アピールポイントカテゴリーの削除に失敗しました')
          return
        }

        toast.success('アピールポイントカテゴリーの削除に成功しました')
      } catch (_) {
        toast.error('アピールポイントカテゴリーの削除に失敗しました')
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
