'use client'

import { getFormProps, getInputProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { IconTriangleExclamation } from '@intentui/icons'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type ReactNode, useActionState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/intent-ui/button'
import { Card } from '~/components/ui/intent-ui/card'
import { Form } from '~/components/ui/intent-ui/form'
import { Loader } from '~/components/ui/intent-ui/loader'
import { TextField } from '~/components/ui/intent-ui/text-field'
import { signInAction } from '~/features/auth/actions/sign-in-action'
import {
  type SignInInputSchema,
  signInInputSchema,
} from '~/features/auth/types/schemas/sing-in-input-schema'

import { useSafeForm } from '~/hooks/use-safe-form'
import { withCallbacks } from '~/utils/with-callbacks'

export function SignInForm({
  children,
  notHaveAccountArea,
}: { children: ReactNode; notHaveAccountArea: ReactNode }) {
  const router = useRouter()

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(signInAction, {
      onSuccess() {
        toast.success('サインインしました')
        router.push('/daily')
      },
      onError() {
        toast.error('サインインに失敗しました')
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
    <Card className="mx-auto w-full max-w-md">
      {children}
      <Form
        {...getFormProps(form)}
        action={action}
        className="flex flex-col items-center justify-center w-full gap-y-4"
      >
        <Card.Content className="space-y-6 w-full">
          {getError() && (
            <div className="bg-danger/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-danger mb-6">
              <IconTriangleExclamation className="size-4" />
              <p>{getError()}</p>
            </div>
          )}
          <div>
            <TextField
              {...getInputProps(fields.email, { type: 'email' })}
              placeholder="メールアドレス"
              isDisabled={isPending}
              errorMessage={''}
            />
            <span id={fields.email.errorId} className="text-sm text-red-500">
              {fields.email.errors}
            </span>
          </div>
          <div className="flex flex-col">
            <TextField
              {...getInputProps(fields.password, { type: 'password' })}
              placeholder="パスワード"
              isDisabled={isPending}
              errorMessage={''}
            />
            <span id={fields.password.errorId} className="text-sm text-red-500">
              {fields.password.errors}
            </span>
            <Link
              href={'/forgot-password'}
              className="text-blue-500 hover:text-blue-500/80 mt-2"
            >
              パスワードをお忘れですか？
            </Link>
          </div>
        </Card.Content>
        <Card.Footer className="flex flex-col items-start gap-y-4 w-full">
          <Button
            type="submit"
            className="w-full relative"
            isDisabled={isPending}
          >
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
        </Card.Footer>
      </Form>
    </Card>
  )
}
