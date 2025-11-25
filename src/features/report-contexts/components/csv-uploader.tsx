'use client'

import { IconTriangleExclamation } from '@intentui/icons'
import { IconFileUpload } from '@tabler/icons-react'
import { useActionState } from 'react'
import { toast } from 'sonner'
import { FileTrigger } from '~/components/ui/intent-ui/file-trigger'
import { ERROR_STATUS, TOAST_MESSAGES } from '~/constants/error-message'
import { uploadAppealCategoriesCsvAction } from '~/features/report-contexts/appeals/actions/upload-appeal-categories-csv-action'
import { uploadClientsCsvAction } from '~/features/report-contexts/clients/actions/upload-clients-csv-action'
import type { ReportContextMenuLabel } from '~/features/report-contexts/components/report-context-menu'
import { uploadMissionsCsvAction } from '~/features/report-contexts/missions/actions/upload-missions-csv-action'
import { uploadProjectsCsvAction } from '~/features/report-contexts/projects/actions/upload-projects-csv-action'
import { uploadTroubleCategoriesCsvAction } from '~/features/report-contexts/troubles/actions/upload-trouble-categories-csv-action'
import { isErrorStatus } from '~/utils'
import { withCallbacks } from '~/utils/with-callbacks'

const UPLOAD_ACTIONS = {
  クライアント: uploadClientsCsvAction,
  プロジェクト: uploadProjectsCsvAction,
  ミッション: uploadMissionsCsvAction,
  カテゴリー: uploadTroubleCategoriesCsvAction,
} as const satisfies Record<
  ReportContextMenuLabel,
  (
    _: unknown,
    formData: FormData,
  ) => Promise<{
    error?: Record<'message', string[]>
    success?: boolean
  }>
>

const TOAST_MESSAGE_KEYS = {
  クライアント: 'CLIENT',
  プロジェクト: 'PROJECT',
  ミッション: 'MISSION',
  カテゴリー: 'TROUBLE',
} as const satisfies Record<ReportContextMenuLabel, string>

export function CsvUploader({
  label,
  categoryType,
}: {
  label: ReportContextMenuLabel
  categoryType?: 'trouble' | 'appeal'
}) {
  const uploadAction =
    label === 'カテゴリー' && categoryType === 'appeal'
      ? uploadAppealCategoriesCsvAction
      : UPLOAD_ACTIONS[label]

  const toastKey =
    label === 'カテゴリー' && categoryType === 'appeal' ? 'APPEAL' : TOAST_MESSAGE_KEYS[label]

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(uploadAction, {
      onSuccess(result) {
        console.log('🚀 ~ CsvUploader ~ result:', result)
        toast.success(TOAST_MESSAGES[toastKey].CSV_UPLOAD_SUCCESS)

        // ?: use cache が experimental で revalidateTag が効かないため、強制的にリロードする
        setTimeout(() => {
          window.location.reload()
        }, 2000)
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

        const errorText = result?.error?.message?.[0] || TOAST_MESSAGES[toastKey].CSV_UPLOAD_FAILED
        toast.error(errorText)
      },
    }),
    null,
  )
  console.log('🚀 ~ CsvUploader ~ lastResult:', lastResult)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return
    }

    const file = files[0]
    const formData = new FormData()
    formData.append('file', file)

    await action(formData)
  }

  return (
    <>
      {lastResult?.error && (
        <div className="mb-6 flex items-center gap-x-2 rounded-md bg-danger/15 p-3 text-danger text-sm">
          <IconTriangleExclamation className="size-4" />
          <p>
            {Array.isArray(lastResult.error.message)
              ? lastResult.error.message.join(', ')
              : 'アップロードに失敗しました'}
          </p>
        </div>
      )}
      <FileTrigger
        intent="primary"
        acceptedFileTypes={['.csv']}
        onSelect={(e) => {
          handleFileSelect(e)
        }}
        isDisabled={isPending}
      >
        <IconFileUpload className="size-4" />
        CSVアップロード
      </FileTrigger>
    </>
  )
}
