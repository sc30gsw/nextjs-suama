import type { ReactNode } from 'react'
import {
  SidebarInset,
  SidebarProvider,
} from '~/components/ui/intent-ui/sidebar'
import { AppSidebar } from '~/components/ui/sidebar/app-sidebar'
import { AppSidebarNav } from '~/components/ui/sidebar/app-sidebar-nav'

export const experimental_ppr = true

export default function WeeklyLayout({
  children,
  breadcrumbs,
}: { children: ReactNode; breadcrumbs: ReactNode }) {
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
