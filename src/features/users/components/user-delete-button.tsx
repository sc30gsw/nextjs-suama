import { IconTrashEmpty } from '@intentui/icons'
import type { InferResponseType } from 'hono'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { buttonStyles } from '~/components/ui/intent-ui/button'
import { Loader } from '~/components/ui/intent-ui/loader'
import { Tooltip } from '~/components/ui/intent-ui/tooltip'
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
        const result = await deleteUserAction(id)

        if (result.status === 'error') {
          const errorMessage = result?.error?.message?.[0]

          if (isErrorStatus(errorMessage)) {
            switch (errorMessage) {
              case ERROR_STATUS.SOMETHING_WENT_WRONG:
                toast.error(TOAST_MESSAGES.USER.DELETE_FAILED)

                return

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
