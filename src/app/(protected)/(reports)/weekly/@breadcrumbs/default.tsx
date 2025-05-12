import { AppBreadcrumbs } from '~/components/ui/app-breadcrumbs'

const ITEMS = [
  { path: '/daily', name: '日報作成' },
  {
    path: '/weekly',
    name: '今年の週報',
  },
  {
    path: '/weekly/list/yyyy-mm-dd',
    name: '週報一覧',
  },
] as const satisfies readonly Record<'path' | 'name', string>[]

export default function WeeklyBreadcrumbsDefaultPage() {
  return <AppBreadcrumbs items={ITEMS} />
}
