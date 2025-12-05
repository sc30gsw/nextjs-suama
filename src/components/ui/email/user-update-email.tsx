import {
  Body,
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

const userUpdateEmailStyles = tv({
  slots: {
    body: 'm-auto bg-white font-sans',
    container: 'mx-auto my-10 max-w-[480px] rounded border border-gray-200 border-solid px-10 py-5',
    heading: 'mx-0 my-7 p-0 text-center',
    content: 'ml-1 leading-4',
  },
  compoundSlots: [{ slots: ['heading', 'content'], class: 'text-black' }],
  variants: {
    size: {
      sm: { content: 'text-sm' },
      lg: { heading: 'font-semibold text-xl' },
    },
  },
})

type UserUpdateEmailProps = Pick<typeof users.$inferSelect, 'email' | 'name'> &
  Partial<Record<'oldEmail' | 'newEmail', (typeof users.$inferSelect)['email']>>

export function UserUpdateEmail({ email, name, oldEmail, newEmail }: UserUpdateEmailProps) {
  const { body, container, heading, content } = userUpdateEmailStyles()

  const isEmailChanged = oldEmail !== undefined && newEmail !== undefined && oldEmail !== newEmail

  return (
    <Html>
      <Head />
      <Preview>{isEmailChanged ? 'メールアドレス変更通知' : 'ユーザー情報更新通知'}</Preview>
      <Tailwind>
        <Body className={body()}>
          <Container className={container()}>
            <Heading className={heading({ size: 'lg' })}>
              {isEmailChanged ? 'メールアドレス変更通知' : 'ユーザー情報更新通知'}
            </Heading>
            <Text className={content({ size: 'sm' })}>
              {name}様
              <br />
              <br />
              {isEmailChanged
                ? 'あなたのアカウントのメールアドレスが変更されました。'
                : 'あなたのアカウント情報が更新されました。'}
            </Text>
            {isEmailChanged && (
              <Text className={content({ size: 'sm' })}>
                <br />
                <strong>変更内容</strong>
                <br />
                旧メールアドレス: {oldEmail}
                <br />
                新メールアドレス: {newEmail}
              </Text>
            )}
            <Text className={content({ size: 'sm' })}>
              <br />
              {isEmailChanged ? (
                <>
                  <strong>ご注意</strong>
                  <br />
                  この変更に心当たりがない場合は、すぐにサポートまでご連絡ください。セキュリティのため、アカウントへの不正アクセスの可能性があります。
                </>
              ) : (
                'この変更に心当たりがない場合は、すぐにサポートまでご連絡ください。'
              )}
            </Text>
            <EmailFooter email={email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
