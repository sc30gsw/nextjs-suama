import { IconLock } from '@intentui/icons'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/intent-ui/button'
import { Loader } from '~/components/ui/intent-ui/loader'
import { TOAST_MESSAGES } from '~/constants/error-message'
import { changePasswordRequestAction } from '~/features/users/actions/change-password-request-action'

export function ChangePasswordButton({ isDisabled }: Record<'isDisabled', boolean>) {
  const [isPending, startTransition] = useTransition()

  const handleRequestPasswordReset = () => {
    startTransition(async () => {
      const result = await changePasswordRequestAction()

      if (result.status === 'error') {
        toast.error(TOAST_MESSAGES.PASSWORD.RESET_REDIRECT_FAILED)

        return
      }

      toast.success(TOAST_MESSAGES.PASSWORD.RESET_REDIRECT)
    })
  }

  return (
    <Button
      intent="outline"
      isDisabled={isPending || isDisabled}
      onPress={handleRequestPasswordReset}
      className="w-full"
    >
      パスワードを変更する
      {isPending ? <Loader className="absolute top-3 right-2" /> : <IconLock />}
    </Button>
  )
}
