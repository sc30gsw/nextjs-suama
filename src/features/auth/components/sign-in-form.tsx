'use client'

import { getFormProps, getInputProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod/v4'
import { IconKey, IconTriangleExclamation } from '@intentui/icons'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type ReactNode, useActionState, useTransition } from 'react'
import { toast } from 'sonner'
import { GlowCard } from '~/components/ui/glow-card'
import { Button } from '~/components/ui/intent-ui/button'
import { Card } from '~/components/ui/intent-ui/card'
import { Form } from '~/components/ui/intent-ui/form'
import { Loader } from '~/components/ui/intent-ui/loader'
import { Separator } from '~/components/ui/intent-ui/separator'
import { TextField } from '~/components/ui/intent-ui/text-field'
import { ERROR_STATUS, getErrorMessage, TOAST_MESSAGES } from '~/constants/error-message'

import { signInAction } from '~/features/auth/actions/sign-in-action'
import {
  type SignInInputSchema,
  signInInputSchema,
} from '~/features/auth/types/schemas/sing-in-input-schema'

import { useSafeForm } from '~/hooks/use-safe-form'
import { authClient } from '~/lib/auth-client'
import { urls } from '~/lib/urls'
import { isErrorStatus } from '~/utils'
import { withCallbacks } from '~/utils/with-callbacks'

export function SignInForm({
  children,
  notHaveAccountArea,
}: {
  children: ReactNode
  notHaveAccountArea: ReactNode
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(signInAction, {
      onSuccess() {
        toast.success(TOAST_MESSAGES.AUTH.SIGN_IN_SUCCESS)
        router.push(urls.href({ route: '/' }))
      },
      onError(result) {
        const errorMessage = result?.error?.message?.[0]

        if (isErrorStatus(errorMessage)) {
          switch (errorMessage) {
            case ERROR_STATUS.SOMETHING_WENT_WRONG:
              toast.error(TOAST_MESSAGES.AUTH.SIGN_IN_FAILED)

              return
          }
        }

        toast.error(TOAST_MESSAGES.AUTH.SIGN_IN_FAILED)
      },
    }),
    null,
  )

  const [form, fields] = useSafeForm<SignInInputSchema>({
    constraint: getZodConstraint(signInInputSchema),
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: signInInputSchema })
    },
    defaultValue: {
      email: '',
      password: '',
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
              {...getInputProps(fields.email, { type: 'email' })}
              placeholder="メールアドレス"
              isDisabled={isPending || pending}
              errorMessage={''}
            />
            <span id={fields.email.errorId} className="text-red-500 text-sm">
              {fields.email.errors}
            </span>
          </div>
          <div className="flex flex-col">
            <TextField
              {...getInputProps(fields.password, { type: 'password' })}
              placeholder="パスワード"
              isDisabled={isPending || pending}
              errorMessage={''}
              isRevealable={true}
            />
            <span id={fields.password.errorId} className="text-red-500 text-sm">
              {fields.password.errors}
            </span>
            <Link
              href={urls.href({ route: '/forgot-password' })}
              className="mt-2 text-blue-500 hover:text-blue-500/80"
            >
              パスワードをお忘れですか？
            </Link>
          </div>
        </Card.Content>
        <Card.Footer className="flex w-full flex-col items-start gap-y-4">
          <div className="w-full">
            <Button type="submit" className="relative w-full" isDisabled={isPending || pending}>
              サインイン
              {isPending && <Loader className="absolute top-3 right-2" />}
            </Button>

            {/* ? Social Connectionによる認証が必要な場合追加 */}
            {/* <Button
            intent="secondary"
            className="w-full relative"
            isDisabled={isPending || isPasskeyPending || isOauthSignInPending}
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
            {notHaveAccountArea}
          </div>
          <Separator orientation="horizontal" />
          <Button
            intent="secondary"
            isDisabled={isPending || pending}
            onPress={() => {
              startTransition(async () => {
                const data = await authClient.signIn.passkey()

                if (data?.error) {
                  toast.error(TOAST_MESSAGES.AUTH.SIGN_IN_FAILED)

                  return
                }

                toast.success(TOAST_MESSAGES.AUTH.SIGN_IN_SUCCESS)
                router.push(urls.href({ route: '/' }))
              })
            }}
            className="w-full"
          >
            パスキーでサインイン
            {pending ? <Loader className="absolute top-3 right-2" /> : <IconKey />}
          </Button>
        </Card.Footer>
      </Form>
    </GlowCard>
  )
}
