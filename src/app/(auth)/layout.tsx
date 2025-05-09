import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { getServerSession } from '~/lib/get-server-session'

export const experimental_ppr = true

export default async function AuthLayout({
  children,
}: { children: ReactNode }) {
  const sessionData = await getServerSession()

  if (sessionData) {
    redirect('/')
  }

  return (
    <main className="flex min-h-dvh min-w-dvw items-center justify-center">
      {children}
    </main>
  )
}
