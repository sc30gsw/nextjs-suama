'use client' // Error boundaries must be Client Components

import { useEffect } from 'react'
import type { NextErrorProps } from '~/types'

export default function GlobalError({ error, reset }: NextErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  )
}
