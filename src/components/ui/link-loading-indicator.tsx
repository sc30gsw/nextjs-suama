'use client'

import { IconChevronLgRight } from '@intentui/icons'
import { useLinkStatus } from 'next/link'
import { Loader } from '~/components/ui/intent-ui/loader'

export function LinkLoadingIndicator() {
  const { pending } = useLinkStatus()

  return pending ? <Loader /> : <IconChevronLgRight />
}
