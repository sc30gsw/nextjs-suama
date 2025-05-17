'use client'

import { getFormProps, getInputProps, useInputControl } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
  IconDocumentEdit,
  IconTriangleExclamation,
  IconX,
} from '@intentui/icons'
import type { InferResponseType } from 'hono'
import { useActionState, useState } from 'react'
import { useToggle } from 'react-use'
import { toast } from 'sonner'
import { Avatar } from '~/components/ui/intent-ui/avatar'
import { Button } from '~/components/ui/intent-ui/button'
import { FileTrigger } from '~/components/ui/intent-ui/file-trigger'
import { Form } from '~/components/ui/intent-ui/form'
import { Loader } from '~/components/ui/intent-ui/loader'
import { Modal } from '~/components/ui/intent-ui/modal'
import { TextField } from '~/components/ui/intent-ui/text-field'
import {} from '~/features/report-contexts/clients/types/schemas/edit-client-input-schema'
import { updateUserAction } from '~/features/users/actions/update-user-action'
import {
  type EditUserInputSchema,
  editUserInputSchema,
} from '~/features/users/types/schemas/edit-client-input-schema'
import { useSafeForm } from '~/hooks/use-safe-form'
import type { client } from '~/lib/rpc'
import { withCallbacks } from '~/utils/with-callbacks'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_SIZE_MB = 5

type EditUserModalProps = Pick<
  InferResponseType<typeof client.api.users.$get, 200>['users'][number],
  'id' | 'name' | 'image'
>

export function EditUserModal({ id, name, image }: EditUserModalProps) {
  const [open, toggle] = useToggle(false)
  const [imageError, setImageError] = useState('')

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(updateUserAction, {
      onSuccess() {
        toast.success('ユーザーの更新に成功しました')
        toggle(false)
        setImageError('')
        location.reload()
      },
      onError() {
        toast.error('ユーザーの更新に失敗しました')
      },
    }),
    null,
  )

  const [form, fields] = useSafeForm<EditUserInputSchema>({
    constraint: getZodConstraint(editUserInputSchema),
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: editUserInputSchema })
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

    // 拡張子制限
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setImageError('画像はJPEG, PNG, WEBP形式のみ対応しています。')
      return
    }

    // // サイズ制限
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setImageError('画像サイズは5MB以下にしてください。')
      return
    }

    // Base64変換
    const base64 = await fileToBase64(file)
    imageInput.change(base64)
    setImageError('')
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
    })
  }

  return (
    <Modal>
      <Button size="small" onPress={toggle}>
        編集
        <IconDocumentEdit />
      </Button>
      <Modal.Content isOpen={open} onOpenChange={toggle}>
        <Modal.Header>
          <Modal.Title>ユーザーを編集する</Modal.Title>
          <Modal.Description>
            選択したユーザーの情報を編集します。
          </Modal.Description>
        </Modal.Header>
        <Form {...getFormProps(form)} action={action}>
          <Modal.Body className="space-y-4">
            {getError() && (
              <div className="bg-danger/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-danger mb-6">
                <IconTriangleExclamation className="size-4" />
                <p>{getError()}</p>
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
              <span id={fields.name.errorId} className="text-sm text-red-500">
                {fields.name.errors}
              </span>
            </div>
            <div className="flex items-center gap-x-4 mt-2">
              <div className="flex flex-col">
                <FileTrigger
                  {...getInputProps(fields.image, { type: 'file' })}
                  acceptedFileTypes={ACCEPTED_TYPES}
                  onSelect={handleSelect}
                  withIcon={true}
                  className="mt-2"
                >
                  画像をアップロード
                </FileTrigger>
                {imageError && (
                  <span className="text-sm text-red-500 break-words">
                    {imageError}
                  </span>
                )}
              </div>
              {imageInput.value ? (
                <div className="relative">
                  <Avatar
                    src={imageInput.value}
                    alt={name}
                    className="size-15 *:size-15"
                  />
                  <Button
                    shape="circle"
                    size="square-petite-small"
                    intent="outline"
                    onPress={() => imageInput.change('')}
                    className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 "
                  >
                    <IconX />
                  </Button>
                </div>
              ) : (
                <Avatar
                  initials={name.charAt(0)}
                  alt={name}
                  className="size-15 *:size-15"
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
