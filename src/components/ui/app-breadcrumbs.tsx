'use client'

import { usePathname } from 'next/navigation'
import { Breadcrumbs } from '~/components/ui/intent-ui/breadcrumbs'
import type { NextjsSuamaRoute } from '../../../typed-url'

// const ITEMS = [
//   { path: '/', name: 'ダッシュボード' },
//   {
//     path: '/daily/today',
//     name: '本日の日報',
//   },
//   {
//     path: '/daily/mine',
//     name: '自分の日報',
//   },
//   {
//     path: '/daily/everyone',
//     name: 'みんなの日報',
//   },
//   {
//     path: '/weekly',
//     name: '今年の週報',
//   },
//   {
//     path: '/aggregate/daily-user',
//     name: 'ユーザーの日時集計',
//   },
//   { path: '/aggregate/user', name: 'ユーザーの簡易集計' },
//   { path: '/aggregate/user', name: 'ユーザーの簡易集計' },
//   { path: '/aggregate/user/detail', name: 'ユーザーの詳細集計' },
//   { path: '/aggregate/mission', name: 'ミッションの詳細集計' },
//   { path: '/aggregate/project', name: 'プロジェクトの詳細集計' },
//   { path: '/users', name: 'ユーザー一覧' },
//   { path: '/clients', name: 'クライアント一覧' },
//   { path: '/clients/register', name: 'クライアント登録' },
//   { path: '/projects', name: 'プロジェクト一覧' },
//   { path: '/projects/register', name: 'プロジェクト登録' },
//   { path: '/missions', name: 'ミッション一覧' },
//   { path: '/missions/register', name: 'ミッション登録' },
//   { path: '/troubles', name: '困っていることカテゴリー一覧' },
//   { path: '/troubles/register', name: '困っていることカテゴリー登録' },
//   { path: '/appeals', name: 'アピールポイントカテゴリー一覧' },
//   { path: '/appeals/register', name: 'アピールポイントカテゴリー登録' },
// ] as const satisfies readonly Record<'path' | 'name', string>[]

export function AppBreadcrumbs({
  items,
}: {
  items: readonly Record<'path' | 'name', NextjsSuamaRoute | string>[]
}) {
  const pathname = usePathname()

  return (
    <Breadcrumbs className="hidden md:flex">
      {items.map((item) => {
        const isActive = item.path === pathname

        return (
          <Breadcrumbs.Item
            key={item.path}
            href={item.path}
            className={isActive ? 'text-muted-fg' : ''}
          >
            {item.name}
          </Breadcrumbs.Item>
        )
      })}
    </Breadcrumbs>
  )
}
