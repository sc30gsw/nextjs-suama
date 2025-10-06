import { IconTrashEmpty } from '@intentui/icons'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/intent-ui/button'
import { Loader } from '~/components/ui/intent-ui/loader'
import { ERROR_STATUS, TOAST_MESSAGES } from '~/constants/error-message'
import { deleteReportAction } from '~/features/reports/daily/actions/delete-report-action'
import { Confirm } from '~/hooks/use-confirm'
import { isErrorStatus } from '~/utils'

type DailyReportDeleteButtonProps = {
  id: string
}

export function DailyReportDeleteButton({ id }: DailyReportDeleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = async () => {
    const ok = await Confirm.call({
      title: '日報を削除',
      message: 'この日報を削除してもよろしいですか？',
    })

    if (!ok) {
      return
    }

    startTransition(async () => {
      try {
        const result = await deleteReportAction(id)

        if (result.status === 'error') {
          const errorMessage = result?.error?.message?.[0]

          if (isErrorStatus(errorMessage)) {
            switch (errorMessage) {
              case ERROR_STATUS.NOT_FOUND:
                toast.error(TOAST_MESSAGES.DAILY_REPORT.NOT_FOUND)
                return

              case ERROR_STATUS.UNAUTHORIZED:
                toast.error(TOAST_MESSAGES.AUTH.UNAUTHORIZED)
                return

              case ERROR_STATUS.FOR_BIDDEN:
                toast.error(TOAST_MESSAGES.DAILY_REPORT.FORBIDDEN)
                return

              default:
                toast.error(TOAST_MESSAGES.DAILY_REPORT.DELETE_FAILED)
                return
            }
          }

          toast.error(TOAST_MESSAGES.DAILY_REPORT.DELETE_FAILED)
          return
        }

        toast.success(TOAST_MESSAGES.DAILY_REPORT.DELETE_SUCCESS)
      } catch (_) {
        toast.error(TOAST_MESSAGES.DAILY_REPORT.DELETE_FAILED)
      }
    })
  }

  return (
    <Button intent="danger" size="small" isDisabled={isPending} onPress={handleDelete}>
      削除
      {isPending ? <Loader /> : <IconTrashEmpty />}
    </Button>
  )
}
