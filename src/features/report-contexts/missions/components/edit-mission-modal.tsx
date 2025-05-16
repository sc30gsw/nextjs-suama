'use client'

import { getFormProps, getInputProps, useInputControl } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { IconDocumentEdit, IconTriangleExclamation } from '@intentui/icons'
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
import { updateMissionAction } from '~/features/report-contexts/missions/actions/update-mission-action'
import {
  type EditMissionInputSchema,
  editMissionInputSchema,
} from '~/features/report-contexts/missions/types/schemas/edit-mission-input-schema'
import {} from '~/features/report-contexts/projects/types/schemas/edit-project-input-schema'
import { useSafeForm } from '~/hooks/use-safe-form'
import type { client } from '~/lib/rpc'
import { withCallbacks } from '~/utils/with-callbacks'

type EditMissionModalProps = Pick<
  InferResponseType<typeof client.api.missions.$get, 200>['missions'][number],
  'id' | 'name' | 'likeKeywords' | 'projectId'
> &
  Record<
    'projects',
    InferResponseType<typeof client.api.projects.$get, 200>['projects']
  >

export function EditMissionModal({
  id,
  name,
  likeKeywords,
  projectId,
  projects,
}: EditMissionModalProps) {
  const [open, toggle] = useToggle(false)
  const [project, setProject] = useState<Key | null>(projectId)

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(updateMissionAction, {
      onSuccess(result) {
        toast.success('ミッションの更新に成功しました')
        toggle(false)
        setProject(result.initialValue?.projectId.toString() ?? '')
      },
      onError() {
        toast.error('ミッションの更新に失敗しました')
      },
    }),
    null,
  )

  const [form, fields] = useSafeForm<EditMissionInputSchema>({
    constraint: getZodConstraint(editMissionInputSchema),
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: editMissionInputSchema })
    },
    defaultValue: {
      id,
      name,
      likeKeywords,
      projectId,
    },
  })

  const projectIdInput = useInputControl(fields.projectId)

  const getError = () => {
    if (lastResult?.error && Array.isArray(lastResult.error.message)) {
      return lastResult.error.message.join(', ')
    }

    return
  }

  return (
    <Modal>
      <Button onPress={toggle}>
        編集
        <IconDocumentEdit />
      </Button>
      <Modal.Content isOpen={open} onOpenChange={toggle}>
        <Modal.Header>
          <Modal.Title>ミッションを編集する</Modal.Title>
          <Modal.Description>
            選択したミッションの情報を編集します。
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
                label="ミッション名"
                placeholder="ミッション名を入力"
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
            <div>
              <TextField
                {...getInputProps(fields.likeKeywords, { type: 'text' })}
                label="検索単語"
                placeholder="検索単語を入力（例: apple,banana,orange）"
                isRequired={true}
                isDisabled={isPending}
                defaultValue={
                  lastResult?.initialValue?.likeKeywords.toString() ??
                  likeKeywords
                }
                errorMessage={''}
              />
              <span
                id={fields.likeKeywords.errorId}
                className="text-sm text-red-500 break-words"
              >
                {fields.likeKeywords.errors}
              </span>
            </div>
            <div>
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
                  projectIdInput.change(key.toString())
                }}
                selectedKey={project}
                className="col-span-2"
              >
                <ComboBox.Input />
                <ComboBox.List items={projects}>
                  {(project) => (
                    <ComboBox.Option id={project.id}>
                      {project.name}
                    </ComboBox.Option>
                  )}
                </ComboBox.List>
              </ComboBox>
              <span
                id={fields.projectId.errorId}
                className="text-sm text-red-500"
              >
                {fields.projectId.errors}
              </span>
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
