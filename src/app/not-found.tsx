import { IconHome } from '@intentui/icons'
import { IconQuestionMark } from '@tabler/icons-react'
import { getYear } from 'date-fns'
import Link from 'next/link'
import { Button } from '~/components/ui/intent-ui/button'
import { Card } from '~/components/ui/intent-ui/card'
import { Separator } from '~/components/ui/intent-ui/separator'
import { LinkLoadingIndicator } from '~/components/ui/link-loading-indicator'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md mx-auto">
        <Card className="max-w-lg">
          <Card.Header className="flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-6">
              <IconQuestionMark className="size-8 text-blue-600 dark:text-blue-500" />
            </div>
            <Card.Title className="text-xl">404 Not Found</Card.Title>
            <Card.Description className="text-center">
              お探しのページは見つかりませんでした。
              <br />
              URLが誤っているか、ページが削除された可能性があります。
              <br />
              もう一度お試しください。
            </Card.Description>
          </Card.Header>
          <Card.Content className="flex flex-col items-center">
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <Link href="/daily">
                <Button intent="outline" className="flex items-center gap-2">
                  ホームに戻る
                  <LinkLoadingIndicator>
                    <IconHome />
                  </LinkLoadingIndicator>
                </Button>
              </Link>
            </div>
          </Card.Content>
          <div className="flex justify-center items-center">
            <Separator orientation="horizontal" className="w-4/5" />
          </div>
          <Card.Footer className="flex items-center justify-center gap-x-2">
            © 2013 - {getYear(new Date())} CLAVES •{' '}
            <a
              // TODO: アドレス未決
              href="technical@example.com"
              className="hover:text-gray-700 dark:hover:text-gray-300 hover:bg-transparent text-sm hover:underline"
            >
              お問い合わせ
            </a>
          </Card.Footer>
        </Card>
      </div>
    </main>
  )
}
