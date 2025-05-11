import { AppBreadcrumbs } from '~/components/ui/app-breadcrumbs'

const ITEMS = [
  { path: '/daily', name: '日報作成' },
] as const satisfies readonly Record<'path' | 'name', string>[]

export default function DailyBreadcrumbsPage() {
  return <AppBreadcrumbs items={ITEMS} />
}
