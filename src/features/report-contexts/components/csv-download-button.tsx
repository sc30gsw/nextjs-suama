import { IconFileDownload } from '@intentui/icons'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/intent-ui/button'
import { Loader } from '~/components/ui/intent-ui/loader'
import { ERROR_STATUS, TOAST_MESSAGES } from '~/constants/error-message'
import { downloadAppealCategoriesCsvAction } from '~/features/report-contexts/appeals/actions/download-appeal-categories-csv-action'
import { downloadClientsCsvAction } from '~/features/report-contexts/clients/actions/download-clients-csv-action'
import type { ReportContextMenuLabel } from '~/features/report-contexts/components/report-context-menu'
import { downloadMissionsCsvAction } from '~/features/report-contexts/missions/actions/download-missions-csv-action'
import { downloadProjectsCsvAction } from '~/features/report-contexts/projects/actions/download-projects-csv-action'
import { downloadTroubleCategoriesCsvAction } from '~/features/report-contexts/troubles/actions/download-trouble-categories-csv-action'
import { createCsvBlob, downloadBlob } from '~/features/report-contexts/utils/csv-utils'
import { isErrorStatus } from '~/utils'

const DOWNLOAD_ACTIONS = {
  クライアント: downloadClientsCsvAction,
  プロジェクト: downloadProjectsCsvAction,
  ミッション: downloadMissionsCsvAction,
  カテゴリー: downloadTroubleCategoriesCsvAction,
} as const satisfies Record<
  ReportContextMenuLabel,
  () => Promise<Partial<Record<'error', Record<'message', string[]>>>>
>

const TOAST_MESSAGE_KEYS = {
  クライアント: 'CLIENT',
  プロジェクト: 'PROJECT',
  ミッション: 'MISSION',
  カテゴリー: 'TROUBLE',
} as const satisfies Record<ReportContextMenuLabel, string>

const CSV_FILENAMES = {
  クライアント: 'clients.csv',
  プロジェクト: 'projects.csv',
  ミッション: 'missions.csv',
  カテゴリー: 'trouble-categories.csv',
} as const satisfies Record<ReportContextMenuLabel, string>

type CsvDownloadButtonProps = {
  label: ReportContextMenuLabel
  categoryType?: 'trouble' | 'appeal'
  onClose: () => void
}

export function CsvDownloadButton({ label, categoryType, onClose }: CsvDownloadButtonProps) {
  const [isPending, startTransition] = useTransition()

  const downloadAction =
    label === 'カテゴリー' && categoryType === 'appeal'
      ? downloadAppealCategoriesCsvAction
      : DOWNLOAD_ACTIONS[label]

  const toastKey =
    label === 'カテゴリー' && categoryType === 'appeal' ? 'APPEAL' : TOAST_MESSAGE_KEYS[label]

  const filename =
    label === 'カテゴリー' && categoryType === 'appeal'
      ? 'appeal-categories.csv'
      : CSV_FILENAMES[label]

  const handleDownload = () => {
    startTransition(async () => {
      try {
        const result = await downloadAction()

        if (result.error) {
          const errorMessage = result.error.message?.[0]

          if (isErrorStatus(errorMessage)) {
            switch (errorMessage) {
              case ERROR_STATUS.UNAUTHORIZED:
                toast.error(TOAST_MESSAGES.AUTH.UNAUTHORIZED)

                return
            }
          }

          toast.error(TOAST_MESSAGES[toastKey].CSV_DOWNLOAD_FAILED)

          return
        }

        if (result.success && result.csv) {
          const blob = createCsvBlob(result.csv)
          downloadBlob(blob, filename)

          toast.success(TOAST_MESSAGES[toastKey].CSV_DOWNLOAD_SUCCESS)

          onClose()
        }
      } catch {
        toast.error(TOAST_MESSAGES[toastKey].CSV_DOWNLOAD_FAILED)
      }
    })
  }

  return (
    <Button intent="primary" isDisabled={isPending} onPress={handleDownload} className="relative">
      {isPending ? (
        <Loader variant="ring" size="medium" className="-top-2 -right-2 absolute" />
      ) : (
        <IconFileDownload className="size-4" />
      )}
      {isPending ? 'ダウンロード中...' : 'CSVダウンロード'}
    </Button>
  )
}
