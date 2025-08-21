'use client'
import { useLinkStatus } from 'next/link'
import type { ReactNode } from 'react'
import { Loader } from '~/components/ui/intent-ui/loader'

export function LinkLoadingIndicator({ children }: { children: ReactNode }) {
  const { pending } = useLinkStatus()

  return pending ? <Loader /> : children
}
