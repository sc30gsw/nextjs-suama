'use client'

import {
  IconBookOpen,
  IconBuilding,
  IconCalendarDays,
  IconCircleQuestionmark,
  IconMessage,
  IconPackage,
  IconTicket,
} from '@intentui/icons'
import { IconReport } from '@tabler/icons-react'
import Link from 'next/link'
import type { ComponentProps } from 'react'
import {
  Sidebar,
  SidebarContent,
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
          className="flex items-center gap-x-2 group-data-[collapsible=dock]:size-10 group-data-[collapsible=dock]:justify-center"
          href="/daily"
        >
          <IconBookOpen className="size-5" />
          <SidebarLabel className="font-medium">SUAMA</SidebarLabel>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarSectionGroup>
          <SidebarDisclosureGroup defaultExpandedKeys={[1]}>
            <SidebarDisclosure id={1}>
              <SidebarDisclosureTrigger>
                <IconReport stroke={1} size={20} className="mr-1" />
                <SidebarLabel>日報</SidebarLabel>
              </SidebarDisclosureTrigger>
              <SidebarDisclosurePanel>
                <SidebarItem href="#" tooltip="Tickets">
                  <IconTicket />
                  <SidebarLabel>本日の日報</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="#" tooltip="Chat Support">
                  <IconMessage />
                  <SidebarLabel>自分の日報</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="#" tooltip="FAQ">
                  <IconCircleQuestionmark />
                  <SidebarLabel>みんなの日報</SidebarLabel>
                </SidebarItem>
              </SidebarDisclosurePanel>
            </SidebarDisclosure>

            <SidebarDisclosure id={2}>
              <SidebarDisclosureTrigger>
                <IconCalendarDays />
                <SidebarLabel>週報</SidebarLabel>
              </SidebarDisclosureTrigger>
              <SidebarDisclosurePanel>
                <SidebarItem href="/weekly" tooltip="今年の週報">
                  <IconCalendarDays />
                  <SidebarLabel>今年の週報</SidebarLabel>
                </SidebarItem>
              </SidebarDisclosurePanel>
            </SidebarDisclosure>

            <SidebarDisclosure id={3}>
              <SidebarDisclosureTrigger>
                <IconPackage />
                <SidebarLabel>集計</SidebarLabel>
              </SidebarDisclosureTrigger>
              <SidebarDisclosurePanel>
                <SidebarItem href="#" tooltip="Warehouse">
                  <IconBuilding />
                  <SidebarLabel>ユーザーの日時集計</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="#" tooltip="FAQ">
                  <IconCircleQuestionmark />
                  <SidebarLabel>ユーザーの簡易集計</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="#" tooltip="FAQ">
                  <IconCircleQuestionmark />
                  <SidebarLabel>ユーザーの詳細集計</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="#" tooltip="FAQ">
                  <IconCircleQuestionmark />
                  <SidebarLabel>ミッションの詳細集計</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="#" tooltip="FAQ">
                  <IconCircleQuestionmark />
                  <SidebarLabel>プロジェクトの詳細集計</SidebarLabel>
                </SidebarItem>
              </SidebarDisclosurePanel>
            </SidebarDisclosure>

            <SidebarDisclosure id={4}>
              <SidebarDisclosureTrigger>
                <IconPackage />
                <SidebarLabel>ユーザー</SidebarLabel>
              </SidebarDisclosureTrigger>
              <SidebarDisclosurePanel>
                <SidebarItem href="#" tooltip="Warehouse">
                  <IconBuilding />
                  <SidebarLabel>ユーザー一覧</SidebarLabel>
                </SidebarItem>
              </SidebarDisclosurePanel>
            </SidebarDisclosure>

            <SidebarDisclosure id={5}>
              <SidebarDisclosureTrigger>
                <IconPackage />
                <SidebarLabel>クライアント</SidebarLabel>
              </SidebarDisclosureTrigger>
              <SidebarDisclosurePanel>
                <SidebarItem href="#" tooltip="Warehouse">
                  <IconBuilding />
                  <SidebarLabel>クライアント一覧</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="#" tooltip="Warehouse">
                  <IconBuilding />
                  <SidebarLabel>クライアント登録</SidebarLabel>
                </SidebarItem>
              </SidebarDisclosurePanel>
            </SidebarDisclosure>

            <SidebarDisclosure id={6}>
              <SidebarDisclosureTrigger>
                <IconPackage />
                <SidebarLabel>プロジェクト</SidebarLabel>
              </SidebarDisclosureTrigger>
              <SidebarDisclosurePanel>
                <SidebarItem href="#" tooltip="Warehouse">
                  <IconBuilding />
                  <SidebarLabel>プロジェクト一覧</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="#" tooltip="Warehouse">
                  <IconBuilding />
                  <SidebarLabel>プロジェクト登録</SidebarLabel>
                </SidebarItem>
              </SidebarDisclosurePanel>
            </SidebarDisclosure>

            <SidebarDisclosure id={7}>
              <SidebarDisclosureTrigger>
                <IconPackage />
                <SidebarLabel>ミッション</SidebarLabel>
              </SidebarDisclosureTrigger>
              <SidebarDisclosurePanel>
                <SidebarItem href="#" tooltip="Warehouse">
                  <IconBuilding />
                  <SidebarLabel>ミッション一覧</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="#" tooltip="Warehouse">
                  <IconBuilding />
                  <SidebarLabel>ミッション登録</SidebarLabel>
                </SidebarItem>
              </SidebarDisclosurePanel>
            </SidebarDisclosure>

            <SidebarDisclosure id={8}>
              <SidebarDisclosureTrigger>
                <IconPackage />
                <SidebarLabel>困っていることカテゴリー</SidebarLabel>
              </SidebarDisclosureTrigger>
              <SidebarDisclosurePanel>
                <SidebarItem href="#" tooltip="Warehouse">
                  <IconBuilding />
                  <SidebarLabel>カテゴリー一覧</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="#" tooltip="Warehouse">
                  <IconBuilding />
                  <SidebarLabel>カテゴリー登録</SidebarLabel>
                </SidebarItem>
              </SidebarDisclosurePanel>
            </SidebarDisclosure>

            <SidebarDisclosure id={9}>
              <SidebarDisclosureTrigger>
                <IconPackage />
                <SidebarLabel>アピールポイントカテゴリー</SidebarLabel>
              </SidebarDisclosureTrigger>
              <SidebarDisclosurePanel>
                <SidebarItem href="#" tooltip="Warehouse">
                  <IconBuilding />
                  <SidebarLabel>カテゴリー一覧</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="#" tooltip="Warehouse">
                  <IconBuilding />
                  <SidebarLabel>カテゴリー登録</SidebarLabel>
                </SidebarItem>
              </SidebarDisclosurePanel>
            </SidebarDisclosure>
          </SidebarDisclosureGroup>
        </SidebarSectionGroup>
      </SidebarContent>

      <SidebarFooter>
        <AppSidebarUserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
