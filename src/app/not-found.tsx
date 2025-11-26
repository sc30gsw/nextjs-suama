import { IconHome } from '@intentui/icons'
import { IconQuestionMark } from '@tabler/icons-react'
import { getYear } from 'date-fns'
import Link from 'next/link'
import { GlowCard } from '~/components/ui/glow-card'
import { Button } from '~/components/ui/intent-ui/button'
import { Card } from '~/components/ui/intent-ui/card'
import { Separator } from '~/components/ui/intent-ui/separator'
import { LinkLoadingIndicator } from '~/components/ui/link-loading-indicator'
import { urls } from '~/lib/urls'

export default function NotFound() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="mx-auto w-full max-w-md">
        <GlowCard className="max-w-lg">
          <Card.Header className="flex flex-col items-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <IconQuestionMark className="size-8 text-blue-600 dark:text-blue-500" />
            </div>
            <Card.Title className="text-xl">404 Not Found</Card.Title>
            <Card.Description className="wrap-break-words text-center">
              お探しのページは見つかりませんでした。
              <br />
              URLが誤っているか、ページが削除された可能性があります。
              <br />
              もう一度お試しください。
            </Card.Description>
          </Card.Header>
          <Card.Content className="flex flex-col items-center">
            <div className="mb-4 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href={urls.href({ route: '/daily' })}>
                <Button intent="outline" className="flex items-center gap-2">
                  ホームに戻る
                  <LinkLoadingIndicator>
                    <IconHome />
                  </LinkLoadingIndicator>
                </Button>
              </Link>
            </div>
          </Card.Content>
          <div className="flex items-center justify-center">
            <Separator orientation="horizontal" className="w-4/5" />
          </div>
          <Card.Footer className="flex items-center justify-center gap-x-2">
            © 2013 - {getYear(new Date())} CLAVES •{' '}
            <a
              // TODO: アドレス未決
              href="technical@example.com"
              className="text-sm hover:bg-transparent hover:text-gray-700 hover:underline dark:hover:text-gray-300"
            >
              お問い合わせ
            </a>
          </Card.Footer>
        </GlowCard>
      </div>
    </main>
  )
}
