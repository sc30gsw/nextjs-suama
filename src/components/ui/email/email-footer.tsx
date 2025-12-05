import { Hr, Tailwind, Text } from '@react-email/components'
import { tv } from 'tailwind-variants'
import type { users } from '~/db/schema'

const emailFooterStyles = tv({
  slots: {
    hrBorder: 'mx-0 my-6 w-full border border-gray-200',
    text: 'text-[12px] text-gray-500 leading-6',
    emailText: 'text-black',
  },
})

export function EmailFooter({ email }: Pick<typeof users.$inferSelect, 'email'>) {
  const { hrBorder, text, emailText } = emailFooterStyles()

  return (
    <Tailwind>
      <Hr className={hrBorder()} />
      <Text className={text()}>
        このメールは<span className={emailText()}>{email}</span>
        宛に送信されました。このメールに心当たりがない場合は、お手数ですがこのまま削除してください。
      </Text>
    </Tailwind>
  )
}
