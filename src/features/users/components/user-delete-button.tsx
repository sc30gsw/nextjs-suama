import { IconTrashEmpty } from '@intentui/icons'
import type { InferResponseType } from 'hono'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/intent-ui/button'
import { Loader } from '~/components/ui/intent-ui/loader'
import { ERROR_STATUS, TOAST_MESSAGES } from '~/constants/error-message'

import { deleteUserAction } from '~/features/users/actions/delete-user-action'
import { Confirm } from '~/hooks/use-confirm'
import type { client } from '~/lib/rpc'
import { isErrorStatus } from '~/utils'

type UserDeleteButtonProps = Pick<
  InferResponseType<typeof client.api.users.$get, 200>['users'][number],
  'id'
>

export function UserDeleteButton({ id }: UserDeleteButtonProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = async () => {
    const ok = await Confirm.call({
      title: 'ユーザーを削除しますか?',
      message:
        'この操作は取り消せません。ユーザーを削除すると、関連する日報・週報も削除され、ログイン画面にリダイレクトされます。',
    })

    if (!ok) {
      return
    }

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('id', id)

        const result = await deleteUserAction(undefined, formData)

        if (result.status === 'error') {
          const errorMessage = result?.error?.message?.[0]

          if (isErrorStatus(errorMessage)) {
            switch (errorMessage) {
              case ERROR_STATUS.UNAUTHORIZED:
                toast.error(TOAST_MESSAGES.AUTH.UNAUTHORIZED)
                return
            }
          }

          toast.error(TOAST_MESSAGES.USER.DELETE_FAILED)
          return
        }

        toast.success(TOAST_MESSAGES.USER.DELETE_SUCCESS)
        router.push('/sign-in')
      } catch (_) {
        toast.error(TOAST_MESSAGES.USER.DELETE_FAILED)
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
