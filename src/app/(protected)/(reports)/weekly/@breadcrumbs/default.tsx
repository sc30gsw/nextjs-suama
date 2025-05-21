'use client'

import { useParams, usePathname } from 'next/navigation'
import { AppBreadcrumbs } from '~/components/ui/app-breadcrumbs'

const ITEMS = {
  daily: { path: '/daily', name: '日報作成' },
  weekly: {
    path: '/weekly',
    name: '今年の週報',
  },
  weeklyList: {
    path: '/weekly/list',
    name: '週報一覧',
  },
  weeklyRegister: {
    path: '/register',
    name: '週報登録',
  },
} as const satisfies Record<string, Record<'path' | 'name', string>>

export default function WeeklyBreadcrumbsDefaultPage() {
  const pathname = usePathname()
  const params = useParams<Record<'dates', string>>()

  const items: Record<'path' | 'name', string>[] = []

  // 全画面で表示
  items.push(ITEMS.daily)

  if (pathname.startsWith(ITEMS.weekly.path)) {
    items.push(ITEMS.weekly)
  }

  if (pathname.startsWith(ITEMS.weeklyList.path)) {
    items.push({
      name: ITEMS.weeklyList.name,
      path: `${ITEMS.weeklyList.path}/${params.dates}`,
    })
  }

  if (pathname.endsWith(ITEMS.weeklyRegister.path)) {
    items.push({
      name: ITEMS.weeklyList.name,
      path: `${ITEMS.weeklyList.path}/${params.dates}`,
    })
  }

  return <AppBreadcrumbs items={items} />
}
