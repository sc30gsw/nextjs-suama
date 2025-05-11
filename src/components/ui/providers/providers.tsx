'use client'

import { useRouter } from 'next/navigation'
import { type ReactNode, useEffect, useState } from 'react'
import { RouterProvider } from 'react-aria-components'
import { ThemeProvider } from '~/components/ui/intent-ui/theme-provider'
import { NuqsProvider } from '~/components/ui/providers/nuqs-provider'

declare module 'react-aria-components' {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>['push']>[1]
    >
  }
}

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMounted(true)
    }
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <RouterProvider navigate={router.push}>
      <NuqsProvider>
        <ThemeProvider enableSystem={true} attribute="class">
          {children}
        </ThemeProvider>
      </NuqsProvider>
    </RouterProvider>
  )
}
