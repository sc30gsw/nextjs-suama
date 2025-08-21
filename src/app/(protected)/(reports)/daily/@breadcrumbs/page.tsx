'use client'

import { usePathname } from 'next/navigation'
import { AppBreadcrumbs } from '~/components/ui/app-breadcrumbs'

const ITEMS = [
  { path: '/daily', name: '日報作成' },
  {
    path: '/daily/today',
    name: '本日の日報',
  },
  {
    path: '/daily/mine',
    name: '自分の日報',
  },
  { path: '/daily/everyone', name: 'みんなの日報' },
] as const satisfies readonly Record<'path' | 'name', string>[]

export default function DailyBreadcrumbsPage() {
  const pathname = usePathname()

  const filteredItems = ITEMS.filter((item) => item.path === '/daily' || item.path === pathname)

  return <AppBreadcrumbs items={filteredItems} />
}
