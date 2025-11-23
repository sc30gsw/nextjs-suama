'use client'

import { getFormProps, getInputProps, useInputControl } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod/v4'
import { IconPlus, IconTriangleExclamation } from '@intentui/icons'
import type { InferResponseType } from 'hono'
import { useActionState, useState } from 'react'
import type { Key } from 'react-stately'
import { useToggle } from 'react-use'
import { toast } from 'sonner'
import { Button } from '~/components/ui/intent-ui/button'
import { ComboBox } from '~/components/ui/intent-ui/combo-box'
import { Form } from '~/components/ui/intent-ui/form'
import { Loader } from '~/components/ui/intent-ui/loader'
import { Modal } from '~/components/ui/intent-ui/modal'
import { TextField } from '~/components/ui/intent-ui/text-field'
import { RELOAD_DELAY } from '~/constants'
import { ERROR_STATUS, getErrorMessage, TOAST_MESSAGES } from '~/constants/error-message'

import { createMissionAction } from '~/features/report-contexts/missions/actions/create-mission-action'
import {
  type CreateMissionInputSchema,
  createMissionInputSchema,
} from '~/features/report-contexts/missions/types/schemas/create-mission-input-schema'
import { useSafeForm } from '~/hooks/use-safe-form'
import type { client } from '~/lib/rpc'
import { isErrorStatus } from '~/utils'
import { withCallbacks } from '~/utils/with-callbacks'

type CreateMissionModalProps = {
  projects: InferResponseType<typeof client.api.projects.$get, 200>['projects']
}

export function CreateMissionModal({ projects }: CreateMissionModalProps) {
  const [open, toggle] = useToggle(false)
  // form resetがConformのものでは反映されないため
  const [project, setProject] = useState<Key | null>(null)

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(createMissionAction, {
      onSuccess() {
        toast.success(TOAST_MESSAGES.MISSION.CREATE_SUCCESS)
        toggle(false)
        setProject(null)

        // ?: use cache が experimental で revalidateTag が効かないため、強制的にリロードする
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

            case ERROR_STATUS.INVALID_PROJECT_RELATION:
              toast.error(TOAST_MESSAGES.PROJECT.INVALID_RELATION)

              return
          }
        }

        toast.error(TOAST_MESSAGES.MISSION.CREATE_FAILED)
      },
    }),
    null,
  )

  const [form, fields] = useSafeForm<CreateMissionInputSchema>({
    constraint: getZodConstraint(createMissionInputSchema),
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: createMissionInputSchema })
    },
    defaultValue: {
      name: '',
      likeKeywords: '',
      projectId: '',
    },
  })

  const projectId = useInputControl(fields.projectId)

  const getError = () => {
    if (lastResult?.error && Array.isArray(lastResult.error.message)) {
      return lastResult.error.message.join(', ')
    }

    return
  }

  return (
    <Modal>
      <Button intent="outline" onPress={toggle}>
        ミッションを追加
        <IconPlus />
      </Button>
      <Modal.Content isOpen={open} onOpenChange={toggle}>
        <Modal.Header>
          <Modal.Title>ミッションを登録する</Modal.Title>
          <Modal.Description>日報作成で選択できるミッションを登録します。</Modal.Description>
        </Modal.Header>
        <Form {...getFormProps(form)} action={action}>
          <Modal.Body className="space-y-4">
            {getError() && (
              <div className="mb-6 flex items-center gap-x-2 rounded-md bg-danger/15 p-3 text-danger text-sm">
                <IconTriangleExclamation className="size-4" />
                <p>
                  {getErrorMessage('mission', getError() as Parameters<typeof getErrorMessage>[1])}
                </p>
              </div>
            )}
            <div>
              <TextField
                {...getInputProps(fields.name, { type: 'text' })}
                label="ミッション名"
                placeholder="ミッション名を入力"
                isRequired={true}
                autoFocus={true}
                isDisabled={isPending}
                errorMessage={''}
              />
              <span id={fields.name.errorId} className="text-red-500 text-sm">
                {fields.name.errors}
              </span>
            </div>
            <div>
              <TextField
                {...getInputProps(fields.likeKeywords, { type: 'text' })}
                label="検索単語"
                placeholder="検索単語を入力（例: apple,banana,orange）"
                isRequired={true}
                isDisabled={isPending}
                errorMessage={''}
              />
              <span id={fields.likeKeywords.errorId} className="break-words text-red-500 text-sm">
                {fields.likeKeywords.errors}
              </span>
            </div>
            <div>
              {/* // TODO useInputControl を使用して不具合が発生する場合、useControl を使用してみてください。 */}
              {/* // ? https://ja.conform.guide/integration/ui-libraries */}
              <ComboBox
                {...getInputProps(fields.projectId, { type: 'text' })}
                label="プロジェクト"
                placeholder="プロジェクトを選択"
                isDisabled={isPending}
                onSelectionChange={(key) => {
                  if (!key) {
                    return
                  }

                  setProject(key)
                  projectId.change(key.toString())
                }}
                selectedKey={project}
                className="col-span-2"
              >
                <ComboBox.Input />
                <ComboBox.List items={projects}>
                  {(project) => <ComboBox.Option id={project.id}>{project.name}</ComboBox.Option>}
                </ComboBox.List>
              </ComboBox>
              <span id={fields.projectId.errorId} className="text-red-500 text-sm">
                {fields.projectId.errors}
              </span>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close isDisabled={isPending}>閉じる</Modal.Close>
            <Button type="submit" isDisabled={isPending}>
              {isPending ? '登録中...' : '登録する'}
              {isPending ? <Loader /> : <IconPlus />}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Content>
    </Modal>
  )
}
