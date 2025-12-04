import { AppBreadcrumbs } from '~/components/ui/app-breadcrumbs'
import { SidebarInset, SidebarProvider } from '~/components/ui/intent-ui/sidebar'
import { AppSidebar } from '~/components/ui/sidebar/app-sidebar'
import { AppSidebarNav } from '~/components/ui/sidebar/app-sidebar-nav'
import type { NextLayoutProps } from '~/types'

const ITEMS = [
  { path: '/daily', name: '日報作成' },
  { path: '/project/list', name: 'プロジェクト一覧' },
] as const satisfies readonly Record<'path' | 'name', string>[]

export default function ProjectListLayout({ children }: NextLayoutProps) {
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
