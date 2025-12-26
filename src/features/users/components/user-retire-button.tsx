import { IconPersonRemove } from '@intentui/icons'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { buttonStyles } from '~/components/ui/intent-ui/button'
import { Loader } from '~/components/ui/intent-ui/loader'
import { Tooltip } from '~/components/ui/intent-ui/tooltip'
import { ERROR_STATUS, TOAST_MESSAGES } from '~/constants/error-message'
import { retireUserAction } from '~/features/users/actions/retire-user-action'
import { Confirm } from '~/hooks/use-confirm'
import { UserModel } from '~/features/users/api/model'
import { urls } from '~/lib/urls'
import { isErrorStatus } from '~/utils'

type UserRetireButtonProps = Pick<UserModel.getUsersResponse['users'][number], 'id' | 'name'>

export function UserRetireButton({ id, name }: UserRetireButtonProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleRetire = async () => {
    const ok = await Confirm.call({
      title: 'ユーザーを退職済みにしますか?',
      message: (
        <>
          この操作は取り消せません。
          <br />
          選択したユーザー<b>"{name}"</b>が退職済みになります。
        </>
      ),
      expectedInput: name,
      placeholder: '退職者名',
    })

    if (!ok) {
      return
    }

    startTransition(async () => {
      try {
        const result = await retireUserAction(id)

        if (result.status === 'error') {
          const errorMessage = result?.error?.message?.[0]

          if (isErrorStatus(errorMessage)) {
            switch (errorMessage) {
              case ERROR_STATUS.SOMETHING_WENT_WRONG:
                toast.error(TOAST_MESSAGES.USER.RETIRE_FAILED)

                return

              case ERROR_STATUS.UNAUTHORIZED:
                toast.error(TOAST_MESSAGES.AUTH.UNAUTHORIZED)

                return

              case ERROR_STATUS.FOR_BIDDEN:
                toast.error(TOAST_MESSAGES.AUTH.FOR_BIDDEN)

                return
            }
          }

          toast.error(TOAST_MESSAGES.USER.RETIRE_FAILED)
          return
        }

        toast.success(TOAST_MESSAGES.USER.RETIRE_SUCCESS)
        
        if (result.fields.includes('isSelf')) {
          router.push(urls.href({ route: '/' }))
        }
      } catch {
        toast.error(TOAST_MESSAGES.USER.RETIRE_FAILED)
      }
    })
  }

  return (
    <Tooltip delay={0}>
      <Tooltip.Trigger
        className={buttonStyles({ size: 'sm', intent: 'danger' })}
        isDisabled={isPending}
        onPress={handleRetire}
      >
        {isPending ? <Loader /> : <IconPersonRemove />}
      </Tooltip.Trigger>
      <Tooltip.Content>退職済みにする</Tooltip.Content>
    </Tooltip>
  )
}
