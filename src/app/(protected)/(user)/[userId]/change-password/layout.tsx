'use client'

import { useParams } from 'next/navigation'
import { AppBreadcrumbs } from '~/components/ui/app-breadcrumbs'
import { SidebarInset, SidebarProvider } from '~/components/ui/intent-ui/sidebar'
import { AppSidebar } from '~/components/ui/sidebar/app-sidebar'
import { AppSidebarNav } from '~/components/ui/sidebar/app-sidebar-nav'
import type { NextLayoutProps } from '~/types'

// TODO:Server Componentsの脆弱性のため、一時コメントアウト。v16 のマイグレート時に再度有効化
// export const experimental_ppr = true

const ITEMS = [{ path: '/daily', name: '日報作成' }] as const satisfies Record<
  'path' | 'name',
  string
>[]

export default function UserChangePasswordLayout({ children }: NextLayoutProps) {
  const params = useParams<Record<'userId', string>>()

  const items: Record<'path' | 'name', string>[] = [
    ...ITEMS,
    { path: `/${params.userId}/settings`, name: 'ユーザー設定' },
    { path: `/${params.userId}/change-password`, name: 'パスワード変更' },
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
