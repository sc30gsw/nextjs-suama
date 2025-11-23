'use client'

import { getFormProps, getInputProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod/v4'
import { IconCirclePerson, IconTriangleExclamation, IconUnlocked } from '@intentui/icons'
import type { InferResponseType } from 'hono'
import Link from 'next/link'
import { useActionState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/intent-ui/button'
import { Card } from '~/components/ui/intent-ui/card'
import { Form } from '~/components/ui/intent-ui/form'
import { Loader } from '~/components/ui/intent-ui/loader'
import { Separator } from '~/components/ui/intent-ui/separator'
import { TextField } from '~/components/ui/intent-ui/text-field'
import { LinkLoadingIndicator } from '~/components/ui/link-loading-indicator'
import { ERROR_STATUS, TOAST_MESSAGES } from '~/constants/error-message'
import { changePasswordAction } from '~/features/users/actions/change-password-action'
import {
  type ChangePasswordInputSchema,
  changePasswordInputSchema,
} from '~/features/users/types/schemas/change-password-input-schema'
import { useSafeForm } from '~/hooks/use-safe-form'
import type { client } from '~/lib/rpc'
import { urls } from '~/lib/urls'
import { isErrorStatus } from '~/utils'
import { withCallbacks } from '~/utils/with-callbacks'

type ChangePasswordFormProps = Pick<
  InferResponseType<typeof client.api.users.$get, 200>['users'][number],
  'id'
>

export function ChangePasswordForm({ id }: ChangePasswordFormProps) {
  const [lastResult, action, isPending] = useActionState(
    withCallbacks(changePasswordAction, {
      onSuccess() {
        toast.success(TOAST_MESSAGES.PASSWORD.CHANGE_SUCCESS)
      },
      onError(result) {
        const errorMessage = result?.error?.message?.[0]

        if (isErrorStatus(errorMessage)) {
          switch (errorMessage) {
            case ERROR_STATUS.UNAUTHORIZED:
              toast.error(TOAST_MESSAGES.AUTH.UNAUTHORIZED)

              return

            case ERROR_STATUS.NOT_FOUND:
              toast.error(TOAST_MESSAGES.USER.NOT_FOUND)

              return
          }
        }

        toast.error(TOAST_MESSAGES.PASSWORD.CHANGE_FAILED)
      },
    }),
    null,
  )

  const [form, fields] = useSafeForm<ChangePasswordInputSchema>({
    constraint: getZodConstraint(changePasswordInputSchema),
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: changePasswordInputSchema,
      })
    },
    defaultValue: {
      id,
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
    <Form {...getFormProps(form)} action={action}>
      <Card.Content className="space-y-4">
        {getError() && (
          <div className="mb-6 flex items-center gap-x-2 rounded-md bg-danger/15 p-3 text-danger text-sm">
            <IconTriangleExclamation className="size-4" />
            <p>{getError()}</p>
          </div>
        )}
        <input {...getInputProps(fields.id, { type: 'hidden' })} />
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
      <Card.Footer className="flex flex-col items-center gap-y-4 py-4">
        <Button type="submit" isDisabled={isPending} className="w-full">
          {isPending ? '変更中...' : '変更する'}
          {isPending ? <Loader /> : <IconUnlocked />}
        </Button>
        <Separator orientation="horizontal" />
        <Button intent="outline" isDisabled={isPending} className="w-full">
          <Link
            href={urls.build({ route: '/[userId]/settings', params: { userId: id } }).href}
            className="flex items-center gap-x-2"
          >
            ユーザー設定に戻る
            <LinkLoadingIndicator>
              <IconCirclePerson />
            </LinkLoadingIndicator>
          </Link>
        </Button>
      </Card.Footer>
    </Form>
  )
}
