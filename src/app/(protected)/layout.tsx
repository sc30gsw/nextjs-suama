import type { ReactNode } from 'react'
import {
  SidebarInset,
  SidebarProvider,
} from '~/components/ui/intent-ui/sidebar'
import { AppSidebar } from '~/components/ui/sidebar/app-sidebar'
import { AppSidebarNav } from '~/components/ui/sidebar/app-sidebar-nav'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar collapsible="dock" />
      <SidebarInset>
        <AppSidebarNav />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
