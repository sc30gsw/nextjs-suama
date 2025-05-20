import { IconTrashEmpty } from '@intentui/icons'
import type { InferResponseType } from 'hono'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/intent-ui/button'
import { Loader } from '~/components/ui/intent-ui/loader'
import { deleteTroubleCategoryAction } from '~/features/report-contexts/troubles/actions/delete-trouble-category-action'
import type { TroubleCategoriesResponse } from '~/features/reports/daily/types/api-response'
import { Confirm } from '~/hooks/use-confirm'
import type { client } from '~/lib/rpc'

type TroubleCategoryDeleteButtonProps = Pick<
  InferResponseType<
    typeof client.api.troubles.categories.$get,
    200
  >['troubleCategories'][number],
  'id'
>

export function TroubleCategoryDeleteButton({
  id,
}: TroubleCategoryDeleteButtonProps) {
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
          toast.error('困っていることカテゴリーの削除に失敗しました')
          return
        }

        toast.success('困っていることカテゴリーの削除に成功しました')
      } catch (_) {
        toast.error('困っていることカテゴリーの削除に失敗しました')
      }
    })
  }

  return (
    <Button
      intent="danger"
      size="small"
      isDisabled={isPending}
      onPress={handleDelete}
    >
      削除
      {isPending ? <Loader /> : <IconTrashEmpty />}
    </Button>
  )
}
