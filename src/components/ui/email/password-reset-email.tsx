import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Tailwind,
  Text,
} from '@react-email/components'
import { tv } from 'tailwind-variants'
import { EmailFooter } from '~/components/ui/email/email-footer'
import type { users } from '~/db/schema'

const passwordResetEmailStyles = tv({
  slots: {
    body: 'm-auto bg-white font-sans',
    container: 'mx-auto my-10 max-w-[480px] rounded border border-gray-200 border-solid px-10 py-5',
    heading: 'mx-0 my-7 p-0 text-center',
    content: 'ml-1 leading-4',
    button: 'inline-block rounded bg-blue-600 px-6 py-3 text-center text-white no-underline',
    buttonContainer: 'my-6 text-center',
    link: 'break-all text-blue-600',
  },
  compoundSlots: [{ slots: ['heading', 'content'], class: 'text-black' }],
  variants: {
    size: {
      sm: { content: 'text-sm' },
      lg: { heading: 'font-semibold text-xl' },
    },
  },
})

type PasswordResetEmailProps = Pick<typeof users.$inferSelect, 'email'> & {
  resetUrl: string
  type: 'reset' | 'change'
}

export function PasswordResetEmail({ email, resetUrl, type }: PasswordResetEmailProps) {
  const { body, container, heading, content, button, buttonContainer, link } =
    passwordResetEmailStyles()

  const actionText = type === 'change' ? '変更' : '再設定'

  return (
    <Html>
      <Head />
      <Preview>パスワード{actionText}</Preview>
      <Tailwind>
        <Body className={body()}>
          <Container className={container()}>
            <Heading className={heading({ size: 'lg' })}>パスワード{actionText}</Heading>
            <Text className={content({ size: 'sm' })}>
              パスワード{actionText}のリクエストを受け付けました。
            </Text>
            <Text className={content({ size: 'sm' })}>
              以下のボタンをクリックして、新しいパスワードを設定してください。
              <br />
              <br />
              このリンクは24時間有効です。有効期限が過ぎた場合は、再度パスワード{actionText}
              のリクエストを行ってください。
            </Text>
            <div className={buttonContainer()}>
              <Button href={resetUrl} className={button()}>
                パスワードを{actionText}する
              </Button>
            </div>
            <Text className={content({ size: 'sm' })}>
              <strong>ボタンがクリックできない場合</strong>
              <br />
              以下のリンクをコピーしてブラウザのアドレスバーに貼り付けてください：
              <br />
              <span className={link()}>{resetUrl}</span>
            </Text>
            <Text className={content({ size: 'sm' })}>
              <br />
              <strong>ご注意</strong>
              <br />
              このメールに心当たりがない場合は、このメールを無視してください。パスワードは変更されません。
            </Text>
            <EmailFooter email={email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
