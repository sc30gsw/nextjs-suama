'use client'

import { IconMail } from '@intentui/icons'
import { useQueryStates } from 'nuqs'
import { type ReactNode, useTransition } from 'react'
import { toast } from 'sonner'
import { GlowCard } from '~/components/ui/glow-card'
import { Button } from '~/components/ui/intent-ui/button'
import { Card } from '~/components/ui/intent-ui/card'
import { Loader } from '~/components/ui/intent-ui/loader'
import { TOAST_MESSAGES } from '~/constants/error-message'
import { resendVerificationEmailAction } from '~/features/auth/actions/resend-verification-email-action'
import { authSearchParamsParsers } from '~/features/auth/types/search-params/auth-search-params-cache'

export function ResendVerificationEmailForm({ children }: Record<'children', ReactNode>) {
  const [{ from }] = useQueryStates(authSearchParamsParsers)
  const [isPending, startTransition] = useTransition()

  return (
    <GlowCard className="mx-auto w-full max-w-md">
      {children}
      <Card.Footer className="flex w-full flex-col items-start gap-y-4">
        <Button
          onPress={() => {
            startTransition(async () => {
              const result = await resendVerificationEmailAction()

              if (result.status === 'success') {
                toast.success(TOAST_MESSAGES.AUTH.SEND_VERIFICATION_EMAIL_SUCCESS)
              } else {
                toast.error(TOAST_MESSAGES.AUTH.SEND_VERIFICATION_EMAIL_FAILED)
              }
            })
          }}
          className="relative w-full"
          isDisabled={isPending}
        >
          メール認証メールを{from === 'proxy' ? '再送信' : '送信'}
          {isPending ? (
            <Loader className="absolute top-3 right-2" />
          ) : (
            <IconMail className="absolute top-2.5 right-3" />
          )}
        </Button>
      </Card.Footer>
    </GlowCard>
  )
}
