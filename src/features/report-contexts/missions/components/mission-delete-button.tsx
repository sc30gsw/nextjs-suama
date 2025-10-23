import { IconTrashEmpty } from '@intentui/icons'
import type { InferResponseType } from 'hono'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/intent-ui/button'
import { Loader } from '~/components/ui/intent-ui/loader'
import { RELOAD_DELAY } from '~/constants'
import { ERROR_STATUS, TOAST_MESSAGES } from '~/constants/error-message'

import { deleteMissionAction } from '~/features/report-contexts/missions/actions/delete-mission-action'
import { Confirm } from '~/hooks/use-confirm'
import type { client } from '~/lib/rpc'
import { isErrorStatus } from '~/utils'

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
          const errorMessage = result?.error?.message?.[0]

          if (isErrorStatus(errorMessage)) {
            switch (errorMessage) {
              case ERROR_STATUS.SOMETHING_WENT_WRONG:
                toast.error(TOAST_MESSAGES.MISSION.DELETE_FAILED)

                return

              case ERROR_STATUS.UNAUTHORIZED:
                toast.error(TOAST_MESSAGES.AUTH.UNAUTHORIZED)

                return
            }
          }

          toast.error(TOAST_MESSAGES.MISSION.DELETE_FAILED)

          return
        }

        toast.success(TOAST_MESSAGES.MISSION.DELETE_SUCCESS)

        // ?: use cache が experimental で revalidateTag が効かないため、強制的にリロードする
        setTimeout(() => {
          window.location.reload()
        }, RELOAD_DELAY)
      } catch (_) {
        toast.error(TOAST_MESSAGES.MISSION.DELETE_FAILED)
      }
    })
  }

  return (
    <Button intent="danger" size="sm" isDisabled={isPending} onPress={handleDelete}>
      削除
      {isPending ? <Loader /> : <IconTrashEmpty />}
    </Button>
  )
}
