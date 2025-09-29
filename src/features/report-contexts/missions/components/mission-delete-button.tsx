import { IconTrashEmpty } from '@intentui/icons'
import type { InferResponseType } from 'hono'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/intent-ui/button'
import { Loader } from '~/components/ui/intent-ui/loader'
import { TOAST_MESSAGES } from '~/constants'
import { deleteMissionAction } from '~/features/report-contexts/missions/actions/delete-mission-action'
import { Confirm } from '~/hooks/use-confirm'
import type { client } from '~/lib/rpc'

type MissionDeleteButtonProps = Pick<
  InferResponseType<typeof client.api.missions.$get, 200>['missions'][number],
  'id'
>

export function MissionDeleteButton({ id }: MissionDeleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = async () => {
    const ok = await Confirm.call({
      title: 'ミッションを削除しますか?',
      message: 'この操作は取り消せません。',
    })

    if (!ok) {
      return
    }

    startTransition(async () => {
      try {
        const result = await deleteMissionAction(id)

        if (result.status === 'error') {
          toast.error(TOAST_MESSAGES.MISSION_DELETE_FAILED)
          return
        }

        toast.success(TOAST_MESSAGES.MISSION_DELETE_SUCCESS)
      } catch (_) {
        toast.error(TOAST_MESSAGES.MISSION_DELETE_FAILED)
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
