'use client'

import { Breadcrumbs } from '~/components/ui/intent-ui/breadcrumbs'
import { Separator } from '~/components/ui/intent-ui/separator'
import { SidebarNav, SidebarTrigger } from '~/components/ui/intent-ui/sidebar'
import { AppSidebarNavUserMenu } from '~/components/ui/sidebar/app-sidebar-nav-user-menu'

export function AppSidebarNav() {
  return (
    <SidebarNav className="border-b">
      <span className="flex items-center gap-x-4">
        <SidebarTrigger className="-mx-2" />
        <Separator className="h-6" orientation="vertical" />
        {/* TODO: パンくず機能実装 */}
        <Breadcrumbs className="hidden md:flex">
          <Breadcrumbs.Item href="/blocks/sidebar/sidebar-01">
            ダッシュボード
          </Breadcrumbs.Item>
          <Breadcrumbs.Item>Newsletter</Breadcrumbs.Item>
        </Breadcrumbs>
      </span>
      <AppSidebarNavUserMenu />
    </SidebarNav>
  )
}
