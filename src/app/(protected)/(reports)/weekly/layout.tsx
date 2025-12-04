import { SidebarInset, SidebarProvider } from '~/components/ui/intent-ui/sidebar'
import { AppSidebar } from '~/components/ui/sidebar/app-sidebar'
import { AppSidebarNav } from '~/components/ui/sidebar/app-sidebar-nav'
import type { NextLayoutProps } from '~/types'

// TODO:Server Componentsの脆弱性のため、一時コメントアウト。v16 のマイグレート時に再度有効化
// export const experimental_ppr = true

export default function WeeklyLayout({
  children,
  breadcrumbs,
}: NextLayoutProps<undefined, 'breadcrumbs'>) {
  return (
    <SidebarProvider>
      <AppSidebar collapsible="dock" />
      <SidebarInset>
        <AppSidebarNav>{breadcrumbs}</AppSidebarNav>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
