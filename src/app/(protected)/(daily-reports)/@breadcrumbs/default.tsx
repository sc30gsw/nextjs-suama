'use client'

import { usePathname } from 'next/navigation'
import { AppBreadcrumbs } from '~/components/ui/app-breadcrumbs'
import { urls } from '~/lib/urls'
import type { NextjsSuamaRoute } from '../../../../../typed-url'

const ITEMS = [
  { path: urls.href({ route: '/' }), name: '日報作成' },
  {
    path: urls.href({ route: '/daily/today' }),
    name: '本日の日報',
  },
  {
    path: urls.href({ route: '/daily/mine' }),
    name: '自分の日報',
  },
  { path: urls.href({ route: '/daily/every' }), name: 'みんなの日報' },
] as const satisfies readonly Record<'path' | 'name', NextjsSuamaRoute | string>[]

export default function DailyBreadcrumbsDefaultPage() {
  const pathname = usePathname()

  const filteredItems = ITEMS.filter((item) => item.path === '/' || item.path === pathname)
  console.log('🚀 ~ DailyBreadcrumbsDefaultPage ~ filteredItems:', filteredItems)

  return <AppBreadcrumbs items={filteredItems} />
}
