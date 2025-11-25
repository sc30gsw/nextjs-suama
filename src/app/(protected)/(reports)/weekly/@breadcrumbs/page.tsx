'use client'

import { usePathname } from 'next/navigation'
import { AppBreadcrumbs } from '~/components/ui/app-breadcrumbs'
import { urls } from '~/lib/urls'
import type { NextjsSuamaRoute } from '../../../../../../typed-url'

const ITEMS = {
  daily: { path: urls.href({ route: '/daily' }), name: '日報作成' },
  weekly: {
    path: urls.href({ route: '/weekly' }),
    name: '今年の週報',
  },
  weeklyList: {
    path: '/weekly/list',
    name: '週報一覧',
  },
} as const satisfies Record<string, Record<'path' | 'name', NextjsSuamaRoute | string>>

export default function WeeklyBreadcrumbsPage() {
  const pathname = usePathname()

  const items: Record<'path' | 'name', NextjsSuamaRoute | string>[] = []

  // 全画面で表示
  items.push(ITEMS.daily)

  if (pathname.startsWith(ITEMS.weekly.path)) {
    items.push(ITEMS.weekly)
  }

  if (pathname.startsWith(ITEMS.weeklyList.path)) {
    items.push(ITEMS.weeklyList)
  }

  return <AppBreadcrumbs items={items} />
}
