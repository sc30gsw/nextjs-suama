import { IconHome } from '@intentui/icons'
import { IconShieldOff } from '@tabler/icons-react'
import { getYear } from 'date-fns'
import Link from 'next/link'
import { Button } from '~/components/ui/intent-ui/button'
import { Card } from '~/components/ui/intent-ui/card'
import { Separator } from '~/components/ui/intent-ui/separator'
import { LinkLoadingIndicator } from '~/components/ui/link-loading-indicator'

export default function Forbidden() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md mx-auto">
        <Card className="max-w-xl">
          <Card.Header className="flex flex-col items-center">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
              <IconShieldOff className="size-8 text-red-600 dark:text-red-500" />{' '}
            </div>
            <Card.Title className="text-xl">403 Forbidden</Card.Title>
            <Card.Description className="text-center break-words">
              このページのアクセスが拒否されました。
              <br />
              アクセス権限がないか、
              <br />
              ページが削除された可能性があります。
              <br />
              <br />
              ご利用をご希望の場合は、管理者までお問い合わせください。
              <br />
              ご利用をご希望されない場合は、以下のボタンからホーム画面にお戻りください。
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
