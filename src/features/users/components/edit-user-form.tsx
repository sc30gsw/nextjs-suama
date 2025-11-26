'use client'

import { getFormProps, getInputProps, useInputControl } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod/v4'
import {
  IconDocumentEdit,
  IconLock,
  IconPersonPasskey,
  IconTriangleExclamation,
  IconX,
} from '@intentui/icons'
import type { InferResponseType } from 'hono'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Avatar } from '~/components/ui/intent-ui/avatar'
import { Button } from '~/components/ui/intent-ui/button'
import { Card } from '~/components/ui/intent-ui/card'
import { FileTrigger } from '~/components/ui/intent-ui/file-trigger'
import { Form } from '~/components/ui/intent-ui/form'
import { Loader } from '~/components/ui/intent-ui/loader'
import { Separator } from '~/components/ui/intent-ui/separator'
import { TextField } from '~/components/ui/intent-ui/text-field'
import { LinkLoadingIndicator } from '~/components/ui/link-loading-indicator'
import { ACCEPTED_TYPES, MAX_IMAGE_SIZE_MB } from '~/constants'
import { ERROR_STATUS, getErrorMessage, TOAST_MESSAGES } from '~/constants/error-message'
import { settingUserAction } from '~/features/users/actions/setting-user-action'
import {
  type SettingUserInputSchema,
  settingUserInputSchema,
} from '~/features/users/types/schemas/setting-user-input-schema'
import { fileToBase64 } from '~/features/users/utils/file-to-base64'
import { useSafeForm } from '~/hooks/use-safe-form'
import { authClient } from '~/lib/auth-client'
import type { client } from '~/lib/rpc'
import { urls } from '~/lib/urls'
import { isErrorStatus } from '~/utils'
import { withCallbacks } from '~/utils/with-callbacks'

type EditUserFormProps = Pick<
  InferResponseType<typeof client.api.users.$get, 200>['users'][number],
  'id' | 'name' | 'email' | 'image'
>

export function EditUserForm({ id, name, email, image }: EditUserFormProps) {
  const [pending, startTransition] = useTransition()
  const [imageError, setImageError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null!)
  const router = useRouter()

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(settingUserAction, {
      onSuccess() {
        toast.success(TOAST_MESSAGES.USER.UPDATE_SUCCESS)
        setImageError('')
        location.reload()
      },
      onError(result) {
        const errorMessage = result?.error?.message?.[0]

        if (isErrorStatus(errorMessage)) {
          switch (errorMessage) {
            case ERROR_STATUS.UNAUTHORIZED:
              toast.error(TOAST_MESSAGES.AUTH.UNAUTHORIZED, {
                cancel: {
                  label: 'ログイン',
                  onClick: () => router.push(urls.href({ route: '/sign-in' })),
                },
              })

              return

            case ERROR_STATUS.NOT_FOUND:
              toast.error(TOAST_MESSAGES.USER.NOT_FOUND, {
                cancel: {
                  label: '一覧に戻る',
                  onClick: () => router.push(urls.href({ route: '/users' })),
                },
              })

              return
          }
        }

        toast.error(TOAST_MESSAGES.USER.UPDATE_FAILED)
      },
    }),
    null,
  )

  const [form, fields] = useSafeForm<SettingUserInputSchema>({
    constraint: getZodConstraint(settingUserInputSchema),
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: settingUserInputSchema })
    },
    defaultValue: {
      id,
      name,
      email,
      image,
    },
  })

  const imageInput = useInputControl(fields.image)

  const getError = () => {
    if (lastResult?.error && Array.isArray(lastResult.error.message)) {
      return lastResult.error.message.join(', ')
    }

    return
  }

  const handleSelect = async (files: FileList | null) => {
    const file = files?.[0]

    if (!file) {
      return
    }

    if (!ACCEPTED_TYPES.includes(file.type as 'image/jpeg' | 'image/png' | 'image/webp')) {
      setImageError('画像はJPEG, PNG, WEBP形式のみ対応しています。')
      return
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setImageError('画像サイズは5MB以下にしてください。')
      return
    }

    const base64 = await fileToBase64(file)
    imageInput.change(base64)
    setImageError('')
  }

  return (
    <Form {...getFormProps(form)} action={action}>
      <Card.Content className="space-y-4">
        {getError() && (
          <div className="mb-6 flex items-center gap-x-2 rounded-md bg-danger/15 p-3 text-danger text-sm">
            <IconTriangleExclamation className="size-4" />
            <p>{getErrorMessage('user', getError() as Parameters<typeof getErrorMessage>[1])}</p>
          </div>
        )}
        <input {...getInputProps(fields.id, { type: 'hidden' })} />
        <div>
          <TextField
            {...getInputProps(fields.name, { type: 'text' })}
            label="ユーザー名"
            placeholder="ユーザー名を入力"
            isRequired={true}
            autoFocus={true}
            isDisabled={isPending || pending}
            defaultValue={lastResult?.initialValue?.name.toString() ?? name}
            errorMessage={''}
          />
          <span id={fields.name.errorId} className="text-red-500 text-sm">
            {fields.name.errors}
          </span>
        </div>
        <div>
          <TextField
            {...getInputProps(fields.email, { type: 'email' })}
            label="メールアドレス"
            placeholder="メールアドレスを入力"
            isRequired={true}
            isDisabled={isPending || pending}
            defaultValue={lastResult?.initialValue?.email.toString() ?? email}
            errorMessage={''}
          />
          <span id={fields.email.errorId} className="text-red-500 text-sm">
            {fields.email.errors}
          </span>
        </div>
        <div className="my-4 flex items-center gap-x-4">
          <div className="flex flex-col">
            <FileTrigger
              {...getInputProps(fields.image, { type: 'file' })}
              acceptedFileTypes={ACCEPTED_TYPES}
              onSelect={handleSelect}
              ref={fileInputRef}
              className="mt-2"
              isDisabled={isPending || pending}
            >
              画像をアップロード
            </FileTrigger>
            {imageError && (
              <span className="wrap-break-words text-red-500 text-sm">{imageError}</span>
            )}
          </div>
          {imageInput.value ? (
            <div className="group relative w-fit">
              <Avatar
                src={imageInput.value}
                alt={name}
                onClick={() => fileInputRef.current.click()}
                className="size-15 cursor-pointer *:size-15 hover:opacity-80"
              />
              <Button
                isCircle
                size="sq-xs"
                intent="outline"
                isDisabled={isPending || pending}
                onPress={() => imageInput.change('')}
                className="-translate-y-1/2 absolute top-0 right-0 translate-x-1/2 opacity-0 group-hover:opacity-100"
              >
                <IconX />
              </Button>
            </div>
          ) : (
            <Avatar
              initials={name.charAt(0)}
              alt={name}
              onClick={() => fileInputRef.current.click()}
              className="size-15 cursor-pointer *:size-15 hover:opacity-80"
            />
          )}
        </div>
      </Card.Content>
      <Card.Footer className="flex flex-col items-center gap-y-4 py-4">
        <Button type="submit" isDisabled={isPending || pending} className="w-full">
          {isPending ? '更新中...' : '更新する'}
          {isPending ? <Loader /> : <IconDocumentEdit />}
        </Button>
        <Separator orientation="horizontal" />
        <Button
          intent="secondary"
          isDisabled={isPending || pending}
          onPress={() => {
            startTransition(async () => {
              const data = await authClient.passkey.addPasskey()

              if (data?.error) {
                toast.error(TOAST_MESSAGES.USER.PASSKEY_ADD_FAILED)

                return
              }

              toast.success(TOAST_MESSAGES.USER.PASSKEY_ADD_SUCCESS)
            })
          }}
          className="w-full"
        >
          パスキーを追加する
          {pending ? <Loader className="absolute top-3 right-2" /> : <IconPersonPasskey />}
        </Button>
        <Separator orientation="horizontal" />
        <Button intent="outline" isDisabled={isPending || pending} className="w-full">
          <Link
            href={urls.build({ route: '/[userId]/change-password', params: { userId: id } }).href}
            className="flex items-center gap-x-2"
          >
            パスワードを変更する
            <LinkLoadingIndicator>
              <IconLock />
            </LinkLoadingIndicator>
          </Link>
        </Button>
      </Card.Footer>
    </Form>
  )
}
