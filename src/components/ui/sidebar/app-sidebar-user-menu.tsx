import { IconChevronLgDown, IconCirclePerson, IconLogout, IconMoon, IconSun } from '@intentui/icons'
import { IconCalendarEvent, IconCalendarUser, IconReport } from '@tabler/icons-react'
import { useTheme } from 'next-themes'
import { useToggle } from 'react-use'
import { twMerge } from 'tailwind-merge'
import { Avatar } from '~/components/ui/intent-ui/avatar'
import { Menu } from '~/components/ui/intent-ui/menu'
import { SidebarLabel, useSidebar } from '~/components/ui/intent-ui/sidebar'
import { ThemeSwitch } from '~/components/ui/theme-switch'
import { useSignOut } from '~/hooks/use-sign-out'
import { authClient } from '~/lib/auth-client'
import { cn } from '~/utils/classes'

export function AppSidebarUserMenu() {
  const { state } = useSidebar()
  const { data: session } = authClient.useSession()
  const { logout, isPending } = useSignOut()
  const { theme } = useTheme()
  const [isOpen, toggle] = useToggle(false)

  return (
    <Menu isOpen={isOpen} onOpenChange={toggle}>
      <Menu.Trigger className="flex w-full items-center justify-between" aria-label="Profile">
        <div className="flex items-center gap-x-2">
          <Avatar
            size="small"
            alt={session?.user.name}
            src={session?.user?.image}
            initials={session?.user.name.charAt(0)}
          />
          <div className="in-data-[collapsible=dock]:hidden text-sm">
            <SidebarLabel>{session?.user.name}</SidebarLabel>
            <span className="-mt-0.5 block text-muted-fg">{session?.user.email}</span>
          </div>
        </div>
        <IconChevronLgDown className={cn('ml-2 transition-transform', isOpen && 'rotate-180')} />
      </Menu.Trigger>

      <Menu.Content
        className={twMerge(
          'in-data-[sidebar-collapsible=collapsed]:min-w-56 min-w-(--trigger-width)',
          state === 'collapsed' && 'sm:min-w-56',
        )}
        placement="bottom right"
      >
        <Menu.Section>
          <Menu.Header separator={true}>
            <span className="block">{session?.user.name}</span>
            <span className="font-normal text-muted-fg">{session?.user.email}</span>
          </Menu.Header>
        </Menu.Section>

        <Menu.Item href="/daily">
          <IconReport stroke={1} size={20} />
          <Menu.Label>日報作成</Menu.Label>
        </Menu.Item>
        <Menu.Item href="/daily/mine">
          <IconCalendarUser stroke={1} size={20} />
          <Menu.Label>自分の日報</Menu.Label>
        </Menu.Item>
        <Menu.Item href="/daily/today">
          <IconCalendarEvent stroke={1} size={20} />
          <Menu.Label>本日の日報</Menu.Label>
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item href={`/${session?.user.id}/settings`}>
          <IconCirclePerson />
          <Menu.Label>ユーザー設定</Menu.Label>
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item
          closeOnSelect={false}
          className="[&>[slot=label]+[data-slot=icon]]:right-4 [&>[slot=label]+[data-slot=icon]]:bottom-3"
        >
          {theme === 'dark' ? <IconMoon /> : <IconSun />}
          <Menu.Label>テーマ</Menu.Label>
          <span data-slot="icon">
            <ThemeSwitch className="ml-auto" />
          </span>
        </Menu.Item>

        <Menu.Separator />

        <Menu.Item onAction={logout} isDisabled={isPending}>
          <IconLogout />
          <Menu.Label>ログアウト</Menu.Label>
        </Menu.Item>
      </Menu.Content>
    </Menu>
  )
}
