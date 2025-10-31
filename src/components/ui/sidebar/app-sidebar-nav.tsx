'use client'

import type { ReactNode } from 'react'
import { Separator } from '~/components/ui/intent-ui/separator'
import { SidebarNav, SidebarTrigger } from '~/components/ui/intent-ui/sidebar'
import { AppSidebarNavUserMenu } from '~/components/ui/sidebar/app-sidebar-nav-user-menu'

export function AppSidebarNav({ children }: { children: ReactNode }) {
  return (
    <SidebarNav className="border-b">
      <span className="flex items-center gap-x-4">
        <SidebarTrigger className="-mx-2" />
        <Separator className="h-6" orientation="vertical" />
        {children}
      </span>
      <AppSidebarNavUserMenu />
    </SidebarNav>
  )
}
