'use client'

import { getFormProps, getInputProps, useInputControl } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod/v4'
import { IconDocumentEdit, IconTriangleExclamation, IconX } from '@intentui/icons'
import type { InferResponseType } from 'hono'
import { useActionState, useRef, useState } from 'react'
import { useToggle } from 'react-use'
import { toast } from 'sonner'
import { Avatar } from '~/components/ui/intent-ui/avatar'
import { Button, buttonStyles } from '~/components/ui/intent-ui/button'
import { FileTrigger } from '~/components/ui/intent-ui/file-trigger'
import { Form } from '~/components/ui/intent-ui/form'
import { Loader } from '~/components/ui/intent-ui/loader'
import { Modal } from '~/components/ui/intent-ui/modal'
import { TextField } from '~/components/ui/intent-ui/text-field'
import { Tooltip } from '~/components/ui/intent-ui/tooltip'
import { ACCEPTED_TYPES, MAX_IMAGE_SIZE_MB, RELOAD_DELAY } from '~/constants'
import { ERROR_STATUS, getErrorMessage, TOAST_MESSAGES } from '~/constants/error-message'
import { updateUserAction } from '~/features/users/actions/update-user-action'
import {
  type SettingUserInputSchema,
  settingUserInputSchema,
} from '~/features/users/types/schemas/setting-user-input-schema'
import { fileToBase64 } from '~/features/users/utils/file-to-base64'
import { useSafeForm } from '~/hooks/use-safe-form'
import type { client } from '~/lib/rpc'
import { isErrorStatus } from '~/utils'
import { withCallbacks } from '~/utils/with-callbacks'

type EditUserModalProps = Pick<
  InferResponseType<typeof client.api.users.$get, 200>['users'][number],
  'id' | 'name' | 'image'
>

export function EditUserModal({ id, name, image }: EditUserModalProps) {
  const [open, toggle] = useToggle(false)
  const [imageError, setImageError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null!)

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(updateUserAction, {
      onSuccess() {
        toast.success(TOAST_MESSAGES.USER.UPDATE_SUCCESS)
        toggle(false)
        setImageError('')

        // ?: use cache が experimental で updateTag が効かないため、強制的にリロードする
        setTimeout(() => {
          window.location.reload()
        }, RELOAD_DELAY)
      },

      onError(result) {
        const errorMessage = result?.error?.message?.[0]

        if (isErrorStatus(errorMessage)) {
          switch (errorMessage) {
            case ERROR_STATUS.UNAUTHORIZED:
              toast.error(TOAST_MESSAGES.AUTH.UNAUTHORIZED)

              return
          }
        }

        toast.error(TOAST_MESSAGES.USER.UPDATE_FAILED)
      },
    }),
    null,
  )

  const [form, fields] = useSafeForm<Omit<SettingUserInputSchema, 'email'>>({
    constraint: getZodConstraint(settingUserInputSchema.omit({ email: true })),
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: settingUserInputSchema.omit({ email: true }),
      })
    },
    defaultValue: {
      id,
      name,
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
    <Modal>
      <Tooltip delay={0}>
        <Tooltip.Trigger className={buttonStyles({ size: 'sm' })} onPress={toggle}>
          <IconDocumentEdit />
        </Tooltip.Trigger>
        <Tooltip.Content>編集</Tooltip.Content>
      </Tooltip>
      <Modal.Content isOpen={open} onOpenChange={toggle}>
        <Modal.Header>
          <Modal.Title>ユーザーを編集する</Modal.Title>
          <Modal.Description>選択したユーザーの情報を編集します。</Modal.Description>
        </Modal.Header>
        <Form {...getFormProps(form)} action={action}>
          <Modal.Body className="space-y-4">
            {getError() && (
              <div className="mb-6 flex items-center gap-x-2 rounded-md bg-danger/15 p-3 text-danger text-sm">
                <IconTriangleExclamation className="size-4" />
                <p>
                  {getErrorMessage('user', getError() as Parameters<typeof getErrorMessage>[1])}
                </p>
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
                isDisabled={isPending}
                defaultValue={lastResult?.initialValue?.name.toString() ?? name}
                errorMessage={''}
              />
              <span id={fields.name.errorId} className="text-red-500 text-sm">
                {fields.name.errors}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-x-4">
              <div className="flex flex-col">
                <FileTrigger
                  {...getInputProps(fields.image, { type: 'file' })}
                  acceptedFileTypes={ACCEPTED_TYPES}
                  onSelect={handleSelect}
                  ref={fileInputRef}
                  className="mt-2"
                  isDisabled={isPending}
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
                    isDisabled={isPending}
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
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close isDisabled={isPending}>閉じる</Modal.Close>
            <Button type="submit" isDisabled={isPending}>
              {isPending ? '更新中...' : '更新する'}
              {isPending ? <Loader /> : <IconDocumentEdit />}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Content>
    </Modal>
  )
}
