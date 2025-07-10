import { IconLock, IconLogin } from '@intentui/icons'
import { getYear } from 'date-fns'
import Link from 'next/link'
import { Button } from '~/components/ui/intent-ui/button'
import { Card } from '~/components/ui/intent-ui/card'
import { Separator } from '~/components/ui/intent-ui/separator'
import { LinkLoadingIndicator } from '~/components/ui/link-loading-indicator'

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="mx-auto w-full max-w-md">
        <Card className="max-w-lg">
          <Card.Header className="flex flex-col items-center">
            <div className="mb-6 inline-flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <IconLock className="size-8 text-red-600 dark:text-red-500" />
            </div>
            <Card.Title className="text-xl">401 Unauthorized</Card.Title>
            <Card.Description className="text-center">
              このページにアクセスするにはログインが必要です。
              <br />
              セッションの有効期限が切れているか、
              <br />
              アクセス権限がない可能性があります。
              <br />
              お手数ですが、再度、ログインし直してください。
            </Card.Description>
          </Card.Header>
          <Card.Content className="flex flex-col items-center">
            <div className="mb-4 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/sign-in">
                <Button intent="outline" className="flex items-center gap-2">
                  ログイン
                  <LinkLoadingIndicator>
                    <IconLogin />
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
        </Card>
      </div>
    </main>
  )
}
