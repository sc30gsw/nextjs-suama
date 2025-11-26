'use client'

import { getFormProps, getInputProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod/v4'
import { IconTriangleExclamation } from '@intentui/icons'
import { JSX, type ReactNode, useActionState } from 'react'
import { toast } from 'sonner'
import { GlowCard } from '~/components/ui/glow-card'
import { Button } from '~/components/ui/intent-ui/button'
import { Card } from '~/components/ui/intent-ui/card'
import { Form } from '~/components/ui/intent-ui/form'
import { Loader } from '~/components/ui/intent-ui/loader'
import { TextField } from '~/components/ui/intent-ui/text-field'
import { ERROR_STATUS, getErrorMessage, TOAST_MESSAGES } from '~/constants/error-message'

import { forgotPasswordAction } from '~/features/auth/actions/forgot-password-action'
import {
  type SignInInputSchema,
  signInInputSchema,
} from '~/features/auth/types/schemas/sing-in-input-schema'
import { useSafeForm } from '~/hooks/use-safe-form'
import { isErrorStatus } from '~/utils'
import { withCallbacks } from '~/utils/with-callbacks'

type ForgotPasswordFormProps = {
  children: ReactNode
  backToSignIn: JSX.Element
}

export function ForgotPasswordForm({ children, backToSignIn }: ForgotPasswordFormProps) {
  const [lastResult, action, isPending] = useActionState(
    withCallbacks(forgotPasswordAction, {
      onSuccess() {
        toast.success(TOAST_MESSAGES.PASSWORD.RESET_REDIRECT)
      },
      onError(result) {
        const errorMessage = result?.error?.message?.[0]

        if (isErrorStatus(errorMessage)) {
          switch (errorMessage) {
            case ERROR_STATUS.EMAIL_NOT_FOUND:
              toast.error(TOAST_MESSAGES.USER.EMAIL_NOT_FOUND)

              return
          }
        }

        toast.error(TOAST_MESSAGES.PASSWORD.RESET_REDIRECT_FAILED)
      },
    }),
    null,
  )

  const [form, fields] = useSafeForm<Pick<SignInInputSchema, 'email'>>({
    constraint: getZodConstraint(signInInputSchema.pick({ email: true })),
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: signInInputSchema.pick({ email: true }),
      })
    },
    defaultValue: {
      email: '',
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
              isDisabled={isPending}
              errorMessage={''}
            />
            <span id={fields.email.errorId} className="text-red-500 text-sm">
              {fields.email.errors}
            </span>
          </div>
        </Card.Content>
        <Card.Footer className="flex w-full flex-col items-start gap-y-4">
          <Button type="submit" className="relative w-full" isDisabled={isPending}>
            パスワードリセット画面へ
            {isPending && <Loader className="absolute top-3 right-2" />}
          </Button>
          {backToSignIn}
        </Card.Footer>
      </Form>
    </GlowCard>
  )
}
