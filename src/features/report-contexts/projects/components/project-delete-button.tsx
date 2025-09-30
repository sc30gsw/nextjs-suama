import { IconTrashEmpty } from '@intentui/icons'
import type { InferResponseType } from 'hono'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/intent-ui/button'
import { Loader } from '~/components/ui/intent-ui/loader'
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
        const formData = new FormData()
        formData.append('id', id)

        const result = await deleteProjectAction(undefined, formData)

        if (result.status === 'error') {
          const errorMessage = result?.error?.message?.[0]

          if (isErrorStatus(errorMessage)) {
            switch (errorMessage) {
              case ERROR_STATUS.UNAUTHORIZED:
                toast.error(TOAST_MESSAGES.AUTH.UNAUTHORIZED)

                return
            }
          }

          toast.error(TOAST_MESSAGES.PROJECT.DELETE_FAILED)
          return
        }

        toast.success(TOAST_MESSAGES.PROJECT.DELETE_SUCCESS)
      } catch (_) {
        toast.error(TOAST_MESSAGES.PROJECT.DELETE_FAILED)
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
