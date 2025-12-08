'use server'

import { SubmissionResult } from '@conform-to/react'
import { APIError } from 'better-auth/api'
import { headers } from 'next/headers'
import { ERROR_STATUS } from '~/constants/error-message'
import { auth } from '~/lib/auth'

export async function resendVerificationEmailAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return {
        status: 'error',
        error: { message: [ERROR_STATUS.UNAUTHORIZED] },
      } as const satisfies SubmissionResult
    }

    if (session.user.emailVerified) {
      return {
        status: 'error',
        error: { message: [ERROR_STATUS.EMAIL_ALREADY_VERIFIED] },
      } as const satisfies SubmissionResult
    }

    await auth.api.sendVerificationEmail({
      body: {
        email: session.user.email,
        callbackURL: '/verify-email',
      },
    })

    return { status: 'success' } as const satisfies SubmissionResult
  } catch (error) {
    if (error instanceof APIError) {
      return {
        status: 'error',
        error: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
      } as const satisfies SubmissionResult
      }
    }

    return {
      status: 'error',
      error: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
    } as const satisfies SubmissionResult
  }

  


