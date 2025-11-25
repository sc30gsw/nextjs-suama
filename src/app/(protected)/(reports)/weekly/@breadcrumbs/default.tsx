'use client'

import { useParams, usePathname } from 'next/navigation'
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
  weeklyRegister: {
    path: '/register',
    name: '週報登録',
  },
  weeklyEdit: {
    path: '/edit',
    name: '週報編集',
  },
} as const satisfies Record<string, Record<'path' | 'name', NextjsSuamaRoute | string>>

export default function WeeklyBreadcrumbsDefaultPage() {
  const pathname = usePathname()
  const params = useParams<Record<'dates' | 'weeklyReportId', string>>()

  const items: Record<'path' | 'name', NextjsSuamaRoute | string>[] = []

  // 全画面で表示
  items.push(ITEMS.daily)

  if (pathname.startsWith(ITEMS.weekly.path)) {
    items.push(ITEMS.weekly)
  }

  if (pathname.startsWith(ITEMS.weeklyList.path)) {
    items.push({
      name: ITEMS.weeklyList.name,
      path: urls.build({
        route: '/weekly/list/[dates]',
        params: { dates: params.dates },
      }).href,
    })
  }

  if (pathname.endsWith(ITEMS.weeklyRegister.path)) {
    items.push({
      name: ITEMS.weeklyRegister.name,
      path: urls.build({
        route: '/weekly/list/[dates]/register',
        params: { dates: params.dates },
      }).href,
    })
  }

  if (pathname.includes(ITEMS.weeklyEdit.path)) {
    items.push({
      name: ITEMS.weeklyEdit.name,
      path: urls.build({
        route: '/weekly/list/[dates]/edit/[weeklyReportId]',
        params: { dates: params.dates, weeklyReportId: params.weeklyReportId },
      }).href,
    })
  }

  return <AppBreadcrumbs items={items} />
}
