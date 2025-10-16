import { IconCirclePerson, IconLogout, IconMoon, IconSun } from '@intentui/icons'
import { IconCalendarEvent, IconCalendarUser, IconReport } from '@tabler/icons-react'
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
      <Menu.Trigger className="ml-auto cursor-pointer md:hidden" aria-label="Open Menu">
        <Avatar
          alt={session?.user.name}
          src={session?.user?.image}
          initials={session?.user.name.charAt(0)}
        />
      </Menu.Trigger>
      <Menu.Content popover={{ placement: 'bottom end' }} className="min-w-64">
        <Menu.Section>
          <Menu.Header separator={true}>
            <span className="block">Kurt Cobain</span>
            <span className="font-normal text-muted-fg">@cobain</span>
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
          <Menu.Label>ログアウト</Menu.Label>
        </Menu.Item>
      </Menu.Content>
    </Menu>
  )
}
