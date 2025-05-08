import {
  IconChevronLgDown,
  IconDashboard,
  IconLogout,
  IconMoon,
  IconSettings,
  IconShield,
  IconSun,
} from '@intentui/icons'
import { useTheme } from 'next-themes'
import { twMerge } from 'tailwind-merge'
import { Avatar } from '~/components/ui/intent-ui/avatar'
import { Menu } from '~/components/ui/intent-ui/menu'
import { SidebarLabel, useSidebar } from '~/components/ui/intent-ui/sidebar'
import { Switch } from '~/components/ui/intent-ui/switch'
import { useSignOut } from '~/hooks/use-sign-out'
import { authClient } from '~/lib/auth-client'

export function AppSidebarUserMenu() {
  const { theme, setTheme } = useTheme()
  const { state } = useSidebar()
  const { data: session } = authClient.useSession()
  const { logout, isPending } = useSignOut()

  return (
    <Menu>
      <Menu.Trigger className="group" aria-label="Profile">
        <Avatar
          alt={session?.user.name}
          src={session?.user?.image}
          initials={session?.user.name.charAt(0)}
        />
        <div className="in-data-[sidebar-collapsible=dock]:hidden text-sm">
          <SidebarLabel>{session?.user.name}</SidebarLabel>
          <span className="-mt-0.5 block text-muted-fg">
            {session?.user.email}
          </span>
        </div>
        <IconChevronLgDown
          data-slot="chevron"
          className="absolute right-3 size-4 transition-transform group-pressed:rotate-180"
        />
      </Menu.Trigger>
      <Menu.Content
        placement="bottom right"
        className={twMerge(
          state === 'expanded' ? 'sm:min-w-(--trigger-width)' : 'sm:min-w-60',
        )}
      >
        <Menu.Section>
          <Menu.Header separator={true}>
            <span className="block">{session?.user.name}</span>
            <span className="font-normal text-muted-fg">
              {session?.user.email}
            </span>
          </Menu.Header>
        </Menu.Section>

        {/* TODO: 各種アイコン・リンクの設定 */}
        <Menu.Item href="/">
          <IconDashboard />
          ダッシュボード
        </Menu.Item>
        <Menu.Item href="#settings">
          <IconSettings />
          自分の日報
        </Menu.Item>
        <Menu.Item href="#security">
          <IconShield />
          本日の日報
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item className="[&>[slot=label]+[data-slot=icon]]:right-4 [&>[slot=label]+[data-slot=icon]]:bottom-3">
          {theme === 'dark' ? <IconMoon /> : <IconSun />}
          <Menu.Label>テーマ</Menu.Label>
          <span data-slot="icon">
            <Switch
              className="ml-auto"
              isSelected={theme === 'dark'}
              onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            />
          </span>
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item onAction={logout} isDisabled={isPending}>
          <IconLogout />
          ログアウト
        </Menu.Item>
      </Menu.Content>
    </Menu>
  )
}
