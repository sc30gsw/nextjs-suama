import {
  IconDashboard,
  IconLogout,
  IconMoon,
  IconSettings,
  IconShield,
  IconSun,
} from '@intentui/icons'
import { useTheme } from 'next-themes'
import { Avatar } from '~/components/ui/intent-ui/avatar'
import { Menu } from '~/components/ui/intent-ui/menu'
import { Switch } from '~/components/ui/intent-ui/switch'
import { useSignOut } from '~/hooks/use-sign-out'
import { authClient } from '~/lib/auth-client'

export function AppSidebarNavUserMenu() {
  const { theme, setTheme } = useTheme()
  const { data: session } = authClient.useSession()
  const { logout, isPending } = useSignOut()

  return (
    // TODO: 各種リンク・アイコンの設定
    <Menu>
      <Menu.Trigger
        className="ml-auto md:hidden cursor-pointer"
        aria-label="Open Menu"
      >
        <Avatar
          alt={session?.user.name}
          src={session?.user?.image}
          initials={session?.user.name.charAt(0)}
        />
      </Menu.Trigger>
      <Menu.Content placement="bottom" showArrow={true} className="sm:min-w-64">
        <Menu.Section>
          <Menu.Header separator={true}>
            <span className="block">Kurt Cobain</span>
            <span className="font-normal text-muted-fg">@cobain</span>
          </Menu.Header>
        </Menu.Section>
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
