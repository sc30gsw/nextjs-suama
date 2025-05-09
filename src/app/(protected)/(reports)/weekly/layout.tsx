import type { ReactNode } from 'react'
import { AppBreadcrumbs } from '~/components/ui/app-breadcrumbs'
import {
  SidebarInset,
  SidebarProvider,
} from '~/components/ui/intent-ui/sidebar'
import { AppSidebar } from '~/components/ui/sidebar/app-sidebar'
import { AppSidebarNav } from '~/components/ui/sidebar/app-sidebar-nav'

export const experimental_ppr = true

const ITEMS = [
  { path: '/daily', name: '日報作成' },
  {
    path: '/weekly',
    name: '今年の週報',
  },
] as const satisfies readonly Record<'path' | 'name', string>[]

export default function WeeklyLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar collapsible="dock" />
      <SidebarInset>
        <AppSidebarNav>
          <AppBreadcrumbs items={ITEMS} />
        </AppSidebarNav>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
