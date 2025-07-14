import type { SubmissionResult } from '@conform-to/react'

// https://x.com/rwieruch/status/1897686642732785927
type Callbacks<T, R = unknown> = {
  onStart?: () => R
  onEnd?: (reference: R) => void
  onSuccess?: (result: T) => void
  onError?: (result: T) => void
}

export const withCallbacks = <
  Args extends unknown[],
  T extends SubmissionResult<string[]>,
  R = unknown,
>(
  fn: (...args: Args) => Promise<T>,
  callbacks: Callbacks<T, R>,
) => {
  return async (...args: Args) => {
    const reference = callbacks.onStart?.()

    try {
      const result = await fn(...args)

      if (reference) {
        callbacks.onEnd?.(reference)
      }

      if (result.status === 'success') {
        callbacks.onSuccess?.(result)
      }

      if (result.status === 'error') {
        callbacks.onError?.(result)
      }

      return result
    } catch (error) {
      if (reference) {
        callbacks.onEnd?.(reference)
      }
      throw error
    }
  }
}
