'use client'

import { getFormProps, getInputProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { IconTriangleExclamation } from '@intentui/icons'
import { useRouter } from 'next/navigation'
import { type ReactNode, useActionState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/intent-ui/button'
import { Card } from '~/components/ui/intent-ui/card'
import { Form } from '~/components/ui/intent-ui/form'
import { Loader } from '~/components/ui/intent-ui/loader'
import { TextField } from '~/components/ui/intent-ui/text-field'
import { signUpAction } from '~/features/auth/actions/sign-up-action'

import {
  type SignUpInputSchema,
  signUpInputSchema,
} from '~/features/auth/types/schemas/sign-up-input-schema'
import { useSafeForm } from '~/hooks/use-safe-form'
import { withCallbacks } from '~/utils/with-callbacks'

export function SignUpForm({
  children,
  haveAccountArea,
}: { children: ReactNode; haveAccountArea: ReactNode }) {
  const router = useRouter()

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(signUpAction, {
      onSuccess() {
        toast.success('サインアップしました')
        router.push('/')
      },
      onError(result) {
        if (result?.error && Array.isArray(result.error.message)) {
          toast.error(result.error.message.join(', '))

          return
        }

        toast.error('サインアップに失敗しました')
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
              {...getInputProps(fields.name, { type: 'text' })}
              placeholder="ユーザー名"
              isDisabled={isPending}
              errorMessage={''}
            />
            <span id={fields.name.errorId} className="text-sm text-red-500">
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
            <span id={fields.email.errorId} className="text-sm text-red-500">
              {fields.email.errors}
            </span>
          </div>
          <div>
            <TextField
              {...getInputProps(fields.password, { type: 'password' })}
              placeholder="パスワード"
              isDisabled={isPending}
              errorMessage={''}
            />
            <span id={fields.password.errorId} className="text-sm text-red-500">
              {fields.password.errors}
            </span>
          </div>
          <div>
            <TextField
              {...getInputProps(fields.confirmPassword, { type: 'password' })}
              placeholder="確認用パスワード"
              isDisabled={isPending}
              errorMessage={''}
            />
            <span
              id={fields.confirmPassword.errorId}
              className="text-sm text-red-500"
            >
              {fields.confirmPassword.errors}
            </span>
          </div>
        </Card.Content>
        <Card.Footer className="flex flex-col items-start gap-y-4 w-full">
          <Button
            type="submit"
            className="w-full relative"
            isDisabled={isPending}
          >
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
    </Card>
  )
}
