'use server'

import type { SubmissionResult } from '@conform-to/react'
import { ERROR_STATUS } from '~/constants/error-message'
import { auth } from '~/lib/auth'
import { getServerSession } from '~/lib/get-server-session'
import { urls } from '~/lib/urls'

export async function changePasswordRequestAction() {
  const session = await getServerSession()

  if (!session) {
    return {
      status: 'error',
      error: { message: [ERROR_STATUS.UNAUTHORIZED] },
    } as const satisfies SubmissionResult
  }

  await auth.api.requestPasswordReset({
    body: {
      email: session.user.email,
      redirectTo: urls.build({
        route: '/[userId]/change-password',
        params: { userId: session.user.id },
      }).href,
    },
  })

  return {
    status: 'success',
  } as const satisfies SubmissionResult
}
