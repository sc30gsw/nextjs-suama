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

const emailVerificationEmailStyles = tv({
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

type EmailVerificationEmailProps = Pick<typeof users.$inferSelect, 'email'> &
  Record<'verificationUrl', string>

export function EmailVerificationEmail({ email, verificationUrl }: EmailVerificationEmailProps) {
  const { body, container, heading, content, button, buttonContainer, link } =
    emailVerificationEmailStyles()

  return (
    <Html>
      <Head />
      <Preview>メールアドレスの認証</Preview>
      <Tailwind>
        <Body className={body()}>
          <Container className={container()}>
            <Heading className={heading({ size: 'lg' })}>メールアドレスの認証</Heading>
            <Text className={content({ size: 'sm' })}>
              メールアドレスの認証リクエストを受け付けました。
            </Text>
            <Text className={content({ size: 'sm' })}>
              以下のボタンをクリックして、メールアドレスを認証してください。
              <br />
              <br />
              このリンクは24時間有効です。有効期限が過ぎた場合は、再度メール認証のリクエストを行ってください。
            </Text>
            <div className={buttonContainer()}>
              <Button href={verificationUrl} className={button()}>
                メールアドレスを認証する
              </Button>
            </div>
            <Text className={content({ size: 'sm' })}>
              <strong>ボタンがクリックできない場合</strong>
              <br />
              以下のリンクをコピーしてブラウザのアドレスバーに貼り付けてください：
              <br />
              <span className={link()}>{verificationUrl}</span>
            </Text>
            <Text className={content({ size: 'sm' })}>
              <br />
              <strong>ご注意</strong>
              <br />
              このメールに心当たりがない場合は、このメールを無視してください。メールアドレスは認証されません。
            </Text>
            <EmailFooter email={email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
