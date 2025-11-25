import { IconTrashEmpty } from '@intentui/icons'
import type { InferResponseType } from 'hono'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { buttonStyles } from '~/components/ui/intent-ui/button'
import { Loader } from '~/components/ui/intent-ui/loader'
import { Tooltip } from '~/components/ui/intent-ui/tooltip'
import { RELOAD_DELAY } from '~/constants'
import { ERROR_STATUS, TOAST_MESSAGES } from '~/constants/error-message'

import { deleteProjectAction } from '~/features/report-contexts/projects/actions/delete-project-action'
import { Confirm } from '~/hooks/use-confirm'
import type { client } from '~/lib/rpc'
import { isErrorStatus } from '~/utils'

type ProjectDeleteButtonProps = Pick<
  InferResponseType<typeof client.api.projects.$get, 200>['projects'][number],
  'id'
>

export function ProjectDeleteButton({ id }: ProjectDeleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = async () => {
    const ok = await Confirm.call({
      title: 'プロジェクトを削除しますか?',
      message:
        'この操作は取り消せません。プロジェクトを削除すると、関連するミッションも削除されます。',
    })

    if (!ok) {
      return
    }

    startTransition(async () => {
      try {
        const result = await deleteProjectAction(id)

        if (result.status === 'error') {
          const errorMessage = result?.error?.message?.[0]

          if (isErrorStatus(errorMessage)) {
            switch (errorMessage) {
              case ERROR_STATUS.SOMETHING_WENT_WRONG:
                toast.error(TOAST_MESSAGES.PROJECT.DELETE_FAILED)

                return

              case ERROR_STATUS.UNAUTHORIZED:
                toast.error(TOAST_MESSAGES.AUTH.UNAUTHORIZED)

                return
            }
          }

          toast.error(TOAST_MESSAGES.PROJECT.DELETE_FAILED)
          return
        }

        toast.success(TOAST_MESSAGES.PROJECT.DELETE_SUCCESS)

        // ?: use cache が experimental で revalidateTag が効かないため、強制的にリロードする
        setTimeout(() => {
          window.location.reload()
        }, RELOAD_DELAY)
      } catch (_) {
        toast.error(TOAST_MESSAGES.PROJECT.DELETE_FAILED)
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
