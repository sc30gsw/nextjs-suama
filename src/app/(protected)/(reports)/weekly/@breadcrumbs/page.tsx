import { AppBreadcrumbs } from '~/components/ui/app-breadcrumbs'

const ITEMS = [
  { path: '/daily', name: '日報作成' },
  {
    path: '/weekly',
    name: '今年の週報',
  },
] as const satisfies readonly Record<'path' | 'name', string>[]

export default function WeeklyBreadcrumbsPage() {
  return <AppBreadcrumbs items={ITEMS} />
}
