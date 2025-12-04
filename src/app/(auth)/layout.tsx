import { redirect } from 'next/navigation'
import { getServerSession } from '~/lib/get-server-session'
import { urls } from '~/lib/urls'
import type { NextLayoutProps } from '~/types'

// TODO:Server Componentsの脆弱性のため、一時コメントアウト。v16 のマイグレート時に再度有効化
// export const experimental_ppr = true

export default async function AuthLayout({ children }: NextLayoutProps) {
  const sessionData = await getServerSession()

  if (sessionData) {
    redirect(urls.href({ route: '/daily' }))
  }

  return <main className="flex min-h-dvh min-w-dvw items-center justify-center">{children}</main>
}
