'use client'

import {
  IconBrandProducthunt,
  IconBuilding,
  IconBuildings,
  IconBulb,
  IconCalendar,
  IconCalendarEvent,
  IconCalendarStats,
  IconCalendarUser,
  IconCalendarWeek,
  IconCategory,
  IconFolder,
  IconHelpTriangle,
  IconHome,
  IconList,
  IconListCheck,
  IconReport,
  IconUser,
  IconUsers,
} from '@tabler/icons-react'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import {
  Sidebar,
  SidebarDisclosure,
  SidebarDisclosureGroup,
  SidebarDisclosurePanel,
  SidebarDisclosureTrigger,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarRail,
  SidebarSectionGroup,
} from '~/components/ui/intent-ui/sidebar'
import { AppSidebarUserMenu } from '~/components/ui/sidebar/app-sidebar-user-menu'

// TODO: 各種アイコン・リンクの設定
export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Link
          className="flex items-center gap-x-2 group-data-[state=collapsed]:justify-center"
          href="/daily"
        >
          <IconHome stroke={1} size={20} className="text-muted-fg" />
          <SidebarLabel className="font-medium">SUAMA</SidebarLabel>
        </Link>
      </SidebarHeader>

      <SidebarSectionGroup>
        <SidebarDisclosureGroup defaultExpandedKeys={[1]}>
          <SidebarDisclosure id={1} className="py-3">
            <SidebarDisclosureTrigger>
              <IconReport stroke={1} size={20} />
              <SidebarLabel>日報</SidebarLabel>
            </SidebarDisclosureTrigger>
            <SidebarDisclosurePanel className="ml-7 group-data-[state=collapsed]:ml-0">
              <SidebarItem href="/daily/today" tooltip="本日の日報">
                <IconCalendarEvent stroke={1} size={20} />
                <SidebarLabel>本日の日報</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/daily/mine" tooltip="自分の日報">
                <IconCalendarUser stroke={1} size={20} />
                <SidebarLabel>自分の日報</SidebarLabel>
              </SidebarItem>

              {/* TODO: ユーザーの role が admin のみ表示されるように修正する。データ移行のタスクと連携して修正 */}
              <SidebarItem href="/daily/every" tooltip="みんなの日報">
                <IconCalendarStats stroke={1} size={20} />
                <SidebarLabel>みんなの日報</SidebarLabel>
              </SidebarItem>
            </SidebarDisclosurePanel>
          </SidebarDisclosure>

          <SidebarDisclosure id={2} className="py-3">
            <SidebarDisclosureTrigger>
              <IconCalendarWeek stroke={1} size={20} />
              <SidebarLabel>週報</SidebarLabel>
            </SidebarDisclosureTrigger>
            <SidebarDisclosurePanel className="ml-7 group-data-[state=collapsed]:ml-0">
              <SidebarItem href="/weekly" tooltip="今年の週報">
                <IconCalendar stroke={1} size={20} />
                <SidebarLabel>今年の週報</SidebarLabel>
              </SidebarItem>
            </SidebarDisclosurePanel>
          </SidebarDisclosure>

          <SidebarDisclosure id={3} className="py-3">
            <SidebarDisclosureTrigger>
              <IconUser stroke={1} size={20} />
              <SidebarLabel>ユーザー</SidebarLabel>
            </SidebarDisclosureTrigger>
            <SidebarDisclosurePanel className="ml-7 group-data-[state=collapsed]:ml-0">
              <SidebarItem href="/users" tooltip="ユーザー一覧">
                <IconUsers stroke={1} size={20} />
                <SidebarLabel>ユーザー一覧</SidebarLabel>
              </SidebarItem>
            </SidebarDisclosurePanel>
          </SidebarDisclosure>

          <SidebarDisclosure id={4} className="py-3">
            <SidebarDisclosureTrigger>
              <IconBuilding stroke={1} size={20} />
              <SidebarLabel>クライアント</SidebarLabel>
            </SidebarDisclosureTrigger>
            <SidebarDisclosurePanel className="ml-7 group-data-[state=collapsed]:ml-0">
              <SidebarItem href="/client/list" tooltip="クライアント一覧">
                <IconBuildings stroke={1} size={20} />
                <SidebarLabel>クライアント一覧</SidebarLabel>
              </SidebarItem>
            </SidebarDisclosurePanel>
          </SidebarDisclosure>

          <SidebarDisclosure id={5} className="py-3">
            <SidebarDisclosureTrigger>
              <IconBrandProducthunt stroke={1} size={20} />
              <SidebarLabel>プロジェクト</SidebarLabel>
            </SidebarDisclosureTrigger>
            <SidebarDisclosurePanel className="ml-7 group-data-[state=collapsed]:ml-0">
              <SidebarItem href="/project/list" tooltip="プロジェクト一覧">
                <IconFolder stroke={1} size={20} />
                <SidebarLabel>プロジェクト一覧</SidebarLabel>
              </SidebarItem>
            </SidebarDisclosurePanel>
          </SidebarDisclosure>

          <SidebarDisclosure id={6} className="py-3">
            <SidebarDisclosureTrigger>
              <IconList stroke={1} size={20} />
              <SidebarLabel>ミッション</SidebarLabel>
            </SidebarDisclosureTrigger>
            <SidebarDisclosurePanel className="ml-7 group-data-[state=collapsed]:ml-0">
              <SidebarItem href="/mission/list" tooltip="ミッション一覧">
                <IconListCheck stroke={1} size={20} />
                <SidebarLabel>ミッション一覧</SidebarLabel>
              </SidebarItem>
            </SidebarDisclosurePanel>
          </SidebarDisclosure>

          <SidebarDisclosure id={7} className="py-3">
            <SidebarDisclosureTrigger>
              <IconHelpTriangle stroke={1} size={20} />
              <SidebarLabel>困っていることカテゴリー</SidebarLabel>
            </SidebarDisclosureTrigger>
            <SidebarDisclosurePanel className="ml-7 group-data-[state=collapsed]:ml-0">
              <SidebarItem href="/trouble/list" tooltip="カテゴリー一覧">
                <IconCategory stroke={1} size={20} />
                <SidebarLabel>カテゴリー一覧</SidebarLabel>
              </SidebarItem>
            </SidebarDisclosurePanel>
          </SidebarDisclosure>

          <SidebarDisclosure id={8} className="py-3">
            <SidebarDisclosureTrigger>
              <IconBulb stroke={1} size={20} />
              <SidebarLabel>アピールポイントカテゴリー</SidebarLabel>
            </SidebarDisclosureTrigger>
            <SidebarDisclosurePanel className="ml-7 group-data-[state=collapsed]:ml-0">
              <SidebarItem href="/appeal/list" tooltip="カテゴリー一覧">
                <IconCategory stroke={1} size={20} />
                <SidebarLabel>カテゴリー一覧</SidebarLabel>
              </SidebarItem>
            </SidebarDisclosurePanel>
          </SidebarDisclosure>
        </SidebarDisclosureGroup>
      </SidebarSectionGroup>

      <SidebarFooter className="flex flex-row justify-between gap-4 group-data-[state=collapsed]:flex-col">
        <AppSidebarUserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
