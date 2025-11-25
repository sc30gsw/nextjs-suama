import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { TOAST_MESSAGES } from '~/constants/error-message'
import { authClient } from '~/lib/auth-client'
import { urls } from '~/lib/urls'

export function useSignOut() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const logout = () => {
    startTransition(async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success(TOAST_MESSAGES.AUTH.SIGN_OUT_SUCCESS)
            router.push(urls.href({ route: '/sign-in' }))
          },
          onError: () => {
            toast.error(TOAST_MESSAGES.AUTH.SIGN_OUT_FAILED)
          },
        },
      })
    })
  }

  return { logout, isPending } as const
}
