'use client'

import { usePathname } from 'next/navigation'
import { AppBreadcrumbs } from '~/components/ui/app-breadcrumbs'
import {
  SidebarInset,
  SidebarProvider,
} from '~/components/ui/intent-ui/sidebar'
import { AppSidebar } from '~/components/ui/sidebar/app-sidebar'
import { AppSidebarNav } from '~/components/ui/sidebar/app-sidebar-nav'
import type { NextLayoutProps } from '~/types'

export const experimental_ppr = true

const ITEMS = [{ path: '/daily', name: '日報作成' }] as const satisfies Record<
  'path' | 'name',
  string
>[]

export default function UserSettingsLayout({ children }: NextLayoutProps) {
  const pathname = usePathname()

  const items: Record<'path' | 'name', string>[] = [
    ...ITEMS,
    { path: pathname, name: 'ユーザー設定' },
  ]

  return (
    <SidebarProvider>
      <AppSidebar collapsible="dock" />
      <SidebarInset>
        <AppSidebarNav>
          <AppBreadcrumbs items={items} />
        </AppSidebarNav>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
