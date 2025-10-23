'use client'

import { useRouter } from 'next/navigation'
import { type ReactNode, useEffect, useState } from 'react'
import { RouterProvider } from 'react-aria-components'
import { SidebarProvider } from '~/components/ui/intent-ui/sidebar'
import { ThemeProvider } from '~/components/ui/intent-ui/theme-provider'
import { NuqsProvider } from '~/components/ui/providers/nuqs-provider'
import { QueryProvider } from '~/components/ui/providers/query-provider'

declare module 'react-aria-components' {
  interface RouterConfig {
    routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>['push']>[1]>
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
        <QueryProvider>
          <ThemeProvider enableSystem={true} attribute="class">
            <SidebarProvider>{children}</SidebarProvider>
          </ThemeProvider>
        </QueryProvider>
      </NuqsProvider>
    </RouterProvider>
  )
}
