'use client'

import { getFormProps, getInputProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod/v4'
import { IconTriangleExclamation } from '@intentui/icons'
import { useRouter } from 'next/navigation'
import { type ReactNode, useActionState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/intent-ui/button'
import { Card } from '~/components/ui/intent-ui/card'
import { Form } from '~/components/ui/intent-ui/form'
import { Loader } from '~/components/ui/intent-ui/loader'
import { TextField } from '~/components/ui/intent-ui/text-field'
import { ERROR_STATUS, TOAST_MESSAGES } from '~/constants/error-message'
import { resetPasswordAction } from '~/features/auth/actions/reset-password-action'
import {
  type PasswordResetInputSchema,
  passwordResetInputSchema,
} from '~/features/auth/types/schemas/reset-password-input-schema'
import { signInInputSchema } from '~/features/auth/types/schemas/sing-in-input-schema'
import { useSafeForm } from '~/hooks/use-safe-form'
import { isErrorStatus } from '~/utils'
import { withCallbacks } from '~/utils/with-callbacks'

type ResetPasswordFormProps = {
  children: ReactNode
  token: string
}

export function ResetPasswordForm({ children, token }: ResetPasswordFormProps) {
  const router = useRouter()

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(resetPasswordAction, {
      onSuccess() {
        toast.success(TOAST_MESSAGES.PASSWORD.RESET_SUCCESS)
        router.push('/sign-in')
      },
      onError(result) {
        const errorMessage = result?.error?.message?.[0]

        if (isErrorStatus(errorMessage)) {
          switch (errorMessage) {
            case ERROR_STATUS.SOMETHING_WENT_WRONG:
              toast.error(TOAST_MESSAGES.PASSWORD.RESET_FAILED)

              return
          }
        }

        toast.error(TOAST_MESSAGES.PASSWORD.RESET_FAILED)
      },
    }),
    null,
  )

  const [form, fields] = useSafeForm<PasswordResetInputSchema>({
    constraint: getZodConstraint(signInInputSchema.pick({ email: true })),
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: passwordResetInputSchema,
      })
    },
    defaultValue: {
      password: '',
      token,
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
        className="flex w-full flex-col items-center justify-center gap-y-4"
      >
        <Card.Content className="w-full space-y-6">
          {getError() && (
            <div className="mb-6 flex items-center gap-x-2 rounded-md bg-danger/15 p-3 text-danger text-sm">
              <IconTriangleExclamation className="size-4" />
              <p>{getError()}</p>
            </div>
          )}

          <TextField
            {...getInputProps(fields.token, { type: 'hidden' })}
            value={fields.token.value}
            className="hidden"
          />
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
            パスワードをリセット
            {isPending && <Loader className="absolute top-3 right-2" />}
          </Button>
        </Card.Footer>
      </Form>
    </Card>
  )
}
