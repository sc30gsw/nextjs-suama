import { forbidden, unauthorized } from 'next/navigation'
import { getServerSession } from '~/lib/get-server-session'
import type { NextLayoutProps } from '~/types'

export default async function EveryDailyReportLayout({ children }: NextLayoutProps) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  if (session.user.role !== 'admin') {
    forbidden()
  }

  return <>{children}</>
}
