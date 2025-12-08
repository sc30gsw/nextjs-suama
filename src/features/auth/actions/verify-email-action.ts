'use server'

import { APIError } from 'better-auth/api'
import { ERROR_STATUS } from '~/constants/error-message'
import { auth } from '~/lib/auth'

export async function verifyEmailAction(token: string) {
  try {
    await auth.api.verifyEmail({
      query: {
        token,
      },
    })

    return { success: true }
  } catch (error) {
    if (error instanceof APIError) {
      return {
        success: false,
        error: ERROR_STATUS.SOMETHING_WENT_WRONG,
      }
    }

    return {
      success: false,
      error: ERROR_STATUS.SOMETHING_WENT_WRONG,
    }
  }
}

