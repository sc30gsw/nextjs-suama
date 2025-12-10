import { IconCirclePerson, IconLogout, IconMoon, IconSun } from '@intentui/icons'
import { IconCalendarEvent, IconCalendarUser, IconReport } from '@tabler/icons-react'
import { useTheme } from 'next-themes'
import { useToggle } from 'react-use'
import { Avatar } from '~/components/ui/intent-ui/avatar'
import { Menu } from '~/components/ui/intent-ui/menu'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { ThemeSwitch } from '~/components/ui/theme-switch'
import { useSignOut } from '~/hooks/use-sign-out'
import { authClient } from '~/lib/auth-client'
import { urls } from '~/lib/urls'

export function AppSidebarNavUserMenu() {
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const { logout, isPending } = useSignOut()
  const { theme } = useTheme()
  const [isOpen, toggle] = useToggle(false)

  if (isSessionPending) {
    return (
      <div className="ml-auto flex items-center gap-x-2 md:hidden">
        <Skeleton className="size-10 rounded-full dark:bg-input/80" />
      </div>
    )
  }

  return (
    <Menu isOpen={isOpen} onOpenChange={toggle}>
      <Menu.Trigger className="ml-auto cursor-pointer md:hidden" aria-label="Open Menu">
        <Avatar
          alt={session?.user.name}
          src={session?.user?.image}
          initials={session?.user.name.charAt(0)}
        />
      </Menu.Trigger>
      <Menu.Content popover={{ placement: 'bottom end' }} className="sm:min-w-64">
        <Menu.Section>
          <Menu.Header separator={true}>
            <span className="block">{session?.user.name}</span>
            <span className="font-normal text-muted-fg">{session?.user.email}</span>
          </Menu.Header>
        </Menu.Section>
        <Menu.Item href={urls.href({ route: '/' })}>
          <IconReport stroke={1} size={20} />
          <Menu.Label>日報作成</Menu.Label>
        </Menu.Item>
        <Menu.Item href={urls.href({ route: '/daily/mine' })}>
          <IconCalendarUser stroke={1} size={20} />
          <Menu.Label>自分の日報</Menu.Label>
        </Menu.Item>
        <Menu.Item href={urls.href({ route: '/daily/today' })}>
          <IconCalendarEvent stroke={1} size={20} />
          <Menu.Label>本日の日報</Menu.Label>
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item
          href={
            urls.build({ route: '/[userId]/settings', params: { userId: session?.user.id ?? '' } })
              .href
          }
        >
          <IconCirclePerson />
          <Menu.Label>ユーザー設定</Menu.Label>
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item className="[&>[slot=label]+[data-slot=icon]]:right-4 [&>[slot=label]+[data-slot=icon]]:bottom-3">
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
