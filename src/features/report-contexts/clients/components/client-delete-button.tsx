import { IconTrashEmpty } from '@intentui/icons'
import type { InferResponseType } from 'hono'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/intent-ui/button'
import { Loader } from '~/components/ui/intent-ui/loader'
import { deleteClientAction } from '~/features/report-contexts/clients/actions/delete-client-action'
import { Confirm } from '~/hooks/use-confirm'
import type { client } from '~/lib/rpc'

type ClientDeleteButtonProps = Pick<
  InferResponseType<typeof client.api.clients.$get, 200>['clients'][number],
  'id'
>

export function ClientDeleteButton({ id }: ClientDeleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = async () => {
    const ok = await Confirm.call({
      title: 'クライアントを削除しますか?',
      message:
        'この操作は取り消せません。クライアントを削除すると、関連するプロジェクト・ミッションも削除されます。',
    })

    if (!ok) {
      return
    }

    startTransition(async () => {
      try {
        const result = await deleteClientAction(id)

        if (result.status === 'error') {
          toast.error('クライアントの削除に失敗しました')
          return
        }

        toast.success('クライアントの削除に成功しました')
      } catch (_) {
        toast.error('クライアントの削除に失敗しました')
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
