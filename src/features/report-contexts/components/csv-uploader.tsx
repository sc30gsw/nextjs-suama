import type { SubmissionResult } from '@conform-to/react'
import { IconTriangleExclamation } from '@intentui/icons'
import { useActionState } from 'react'
import { toast } from 'sonner'
import { FileTrigger } from '~/components/ui/intent-ui/file-trigger'
import { RELOAD_DELAY } from '~/constants'
import { ERROR_STATUS, TOAST_MESSAGES } from '~/constants/error-message'
import { uploadAppealCategoriesCsvAction } from '~/features/report-contexts/appeals/actions/upload-appeal-categories-csv-action'
import { uploadClientsCsvAction } from '~/features/report-contexts/clients/actions/upload-clients-csv-action'
import type { ReportContextMenuLabel } from '~/features/report-contexts/components/report-context-menu'
import { uploadMissionsCsvAction } from '~/features/report-contexts/missions/actions/upload-missions-csv-action'
import { uploadProjectsCsvAction } from '~/features/report-contexts/projects/actions/upload-projects-csv-action'
import { uploadTroubleCategoriesCsvAction } from '~/features/report-contexts/troubles/actions/upload-trouble-categories-csv-action'
import { Confirm } from '~/hooks/use-confirm'
import { isErrorStatus } from '~/utils'
import { withCallbacks } from '~/utils/with-callbacks'

const UPLOAD_ACTIONS = {
  クライアント: uploadClientsCsvAction,
  プロジェクト: uploadProjectsCsvAction,
  ミッション: uploadMissionsCsvAction,
  カテゴリー: uploadTroubleCategoriesCsvAction,
} as const satisfies Record<
  ReportContextMenuLabel,
  (_: unknown, formData: FormData) => Promise<SubmissionResult<string[]>>
>

const TOAST_MESSAGE_KEYS = {
  クライアント: 'CLIENT',
  プロジェクト: 'PROJECT',
  ミッション: 'MISSION',
  カテゴリー: 'TROUBLE',
} as const satisfies Record<ReportContextMenuLabel, string>

type CsvUploaderProps = {
  label: ReportContextMenuLabel
  categoryType?: 'trouble' | 'appeal'
  onClose: () => void
}

export function CsvUploader({ label, categoryType, onClose }: CsvUploaderProps) {
  const uploadAction =
    label === 'カテゴリー' && categoryType === 'appeal'
      ? uploadAppealCategoriesCsvAction
      : UPLOAD_ACTIONS[label]

  const toastKey =
    label === 'カテゴリー' && categoryType === 'appeal' ? 'APPEAL' : TOAST_MESSAGE_KEYS[label]

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(uploadAction, {
      onSuccess() {
        toast.success(TOAST_MESSAGES[toastKey].CSV_UPLOAD_SUCCESS)

        onClose()

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

        const errorText = result?.error?.message?.[0] || TOAST_MESSAGES[toastKey].CSV_UPLOAD_FAILED
        toast.error(errorText)
      },
    }),
    null,
  )

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return
    }

    const ok = await Confirm.call({
      title: 'CSVをアップロードしますか?',
      message: (
        <div className="space-y-2">
          <p>この操作により、以下の処理が実行されます：</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              CSVに含まれるデータで、<b>既存データとIDが一致する場合</b>は
              <span className="font-bold text-danger">更新</span>されます
            </li>
            <li>
              CSVに含まれるデータで、<b>既存データとIDが一致しない場合</b>は
              <span className="font-bold text-danger">新規登録</span>されます
            </li>
            <li>CSVにIDが含まれていない行は、すべて新規登録されます</li>
          </ul>
          <p className="font-bold text-danger">※ この操作は取り消せません。</p>
        </div>
      ),
    })

    if (!ok) {
      return
    }

    const file = files[0]
    const formData = new FormData()
    formData.append('file', file)

    action(formData)
  }

  return (
    <>
      {lastResult?.error && (
        <div className="flex items-center gap-x-2 rounded-md bg-danger/15 p-3 text-danger text-sm">
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
        isPending={isPending}
      >
        {isPending ? 'アップロード中...' : 'CSVアップロード'}
      </FileTrigger>
    </>
  )
}
