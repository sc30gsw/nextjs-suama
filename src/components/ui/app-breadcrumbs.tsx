'use client'

import { usePathname } from 'next/navigation'
import { Breadcrumbs } from '~/components/ui/intent-ui/breadcrumbs'
import type { NextjsSuamaRoute } from '../../../typed-url'

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
