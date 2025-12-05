'use client'

import { getFormProps, getInputProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod/v4'
import { IconTriangleExclamation } from '@intentui/icons'
import { useRouter } from 'next/navigation'
import { type ReactNode, useActionState } from 'react'
import { toast } from 'sonner'
import { GlowCard } from '~/components/ui/glow-card'
import { Button } from '~/components/ui/intent-ui/button'
import { Card } from '~/components/ui/intent-ui/card'
import { Form } from '~/components/ui/intent-ui/form'
import { Loader } from '~/components/ui/intent-ui/loader'
import { TextField } from '~/components/ui/intent-ui/text-field'
import { ERROR_STATUS, getErrorMessage, TOAST_MESSAGES } from '~/constants/error-message'

import { signUpAction } from '~/features/auth/actions/sign-up-action'

import {
  type SignUpInputSchema,
  signUpInputSchema,
} from '~/features/auth/types/schemas/sign-up-input-schema'
import { useSafeForm } from '~/hooks/use-safe-form'
import { urls } from '~/lib/urls'
import { isErrorStatus } from '~/utils'
import { withCallbacks } from '~/utils/with-callbacks'

export function SignUpForm({
  children,
  haveAccountArea,
}: {
  children: ReactNode
  haveAccountArea: ReactNode
}) {
  const router = useRouter()

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(signUpAction, {
      onSuccess() {
        toast.success(TOAST_MESSAGES.AUTH.SIGN_UP_SUCCESS)
        router.push(urls.href({ route: '/' }))
      },
      onError(result) {
        const errorMessage = result?.error?.message?.[0]

        if (isErrorStatus(errorMessage)) {
          switch (errorMessage) {
            case ERROR_STATUS.ALREADY_EXISTS:
              toast.error(TOAST_MESSAGES.USER.NAME_OR_EMAIL_ALREADY_EXISTS)

              return
          }
        }

        toast.error(TOAST_MESSAGES.AUTH.SIGN_UP_FAILED)
      },
    }),
    null,
  )

  const [form, fields] = useSafeForm<SignUpInputSchema>({
    constraint: getZodConstraint(signUpInputSchema),
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: signUpInputSchema })
    },
    defaultValue: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const getError = () => {
    if (lastResult?.error && Array.isArray(lastResult.error.message)) {
      return lastResult.error.message.join(', ')
    }

    return
  }

  return (
    <GlowCard className="mx-auto w-full max-w-md">
      {children}
      <Form
        {...getFormProps(form)}
        action={action}
        className="flex w-full flex-col items-center justify-center gap-y-4"
      >
        <Card.Content className="w-full space-y-6">
          {getError() && (
            <div className="mb-6 flex items-center gap-x-2 rounded-md bg-danger/15 p-3 text-danger text-sm">
              <IconTriangleExclamation className="size-4" />
              <p>{getErrorMessage('auth', getError() as Parameters<typeof getErrorMessage>[1])}</p>
            </div>
          )}
          <div>
            <TextField
              {...getInputProps(fields.name, { type: 'text' })}
              placeholder="ユーザー名"
              isDisabled={isPending}
              errorMessage={''}
            />
            <span id={fields.name.errorId} className="text-red-500 text-sm">
              {fields.name.errors}
            </span>
          </div>
          <div>
            <TextField
              {...getInputProps(fields.email, { type: 'email' })}
              placeholder="メールアドレス"
              isDisabled={isPending}
              errorMessage={''}
            />
            <span id={fields.email.errorId} className="text-red-500 text-sm">
              {fields.email.errors}
            </span>
          </div>
          <div>
            <TextField
              {...getInputProps(fields.password, { type: 'password' })}
              placeholder="パスワード"
              isDisabled={isPending}
              errorMessage={''}
              isRevealable={true}
            />
            <span id={fields.password.errorId} className="text-red-500 text-sm">
              {fields.password.errors}
            </span>
          </div>
          <div>
            <TextField
              {...getInputProps(fields.confirmPassword, { type: 'password' })}
              placeholder="確認用パスワード"
              isDisabled={isPending}
              errorMessage={''}
              isRevealable={true}
            />
            <span id={fields.confirmPassword.errorId} className="text-red-500 text-sm">
              {fields.confirmPassword.errors}
            </span>
          </div>
        </Card.Content>
        <Card.Footer className="flex w-full flex-col items-start gap-y-4">
          <Button type="submit" className="relative w-full" isDisabled={isPending}>
            アカウント登録
            {isPending && <Loader className="absolute top-3 right-2" />}
          </Button>
          {/* ? Social Connectionによる認証が必要な場合追加 */}
          {/* <Button
            intent="secondary"
            className="w-full relative"
            isDisabled={isPending || isOauthSignInPending}
            onPress={() => {
              startTransition(async () => {
                await authClient.signIn.social({
                  provider: 'github',
                  // biome-ignore lint/style/useNamingConvention: This is a property of the better auth
                  callbackURL: '/',
                })
              })
            }}
          >
            <IconBrandGoogle />
            Sign In with Google
            {isOauthSignInPending && (
              <Loader className="absolute top-3 right-2" />
            )}
          </Button> */}
          {haveAccountArea}
        </Card.Footer>
      </Form>
    </GlowCard>
  )
}
