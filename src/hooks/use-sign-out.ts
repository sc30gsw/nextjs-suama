import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { authClient } from '~/lib/auth-client'

export function useSignOut() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const logout = () => {
    startTransition(async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success('ログアウトしました')
            router.push('/sign-in')
          },
          onError: () => {
            toast.error('ログアウトに失敗しました')
          },
        },
      })
    })
  }

  return { logout, isPending } as const
}
