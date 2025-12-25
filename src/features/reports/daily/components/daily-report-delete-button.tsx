import { IconTrashEmpty } from '@intentui/icons'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { buttonStyles } from '~/components/ui/intent-ui/button'
import { Loader } from '~/components/ui/intent-ui/loader'
import { Tooltip } from '~/components/ui/intent-ui/tooltip'
import { ERROR_STATUS, TOAST_MESSAGES } from '~/constants/error-message'
import type { dailyReports } from '~/db/schema'
import { deleteReportAction } from '~/features/reports/daily/actions/delete-report-action'
import { Confirm } from '~/hooks/use-confirm'
import { isErrorStatus } from '~/utils'

export function DailyReportDeleteButton({ id }: Pick<typeof dailyReports.$inferSelect, 'id'>) {
  const [isPending, startTransition] = useTransition()
  const _router = useRouter()

  const handleDelete = async () => {
    const ok = await Confirm.call({
      title: '日報を削除しますか？',
      message:
        'この操作は取り消せません。日報を削除すると、関連する職務内容、コメント、アピールも全て削除されます。',
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
      } catch {
        toast.error(TOAST_MESSAGES.DAILY_REPORT.DELETE_FAILED)
      }
    })
  }

  return (
    <Tooltip delay={0}>
      <Tooltip.Trigger
        className={buttonStyles({ size: 'sm', intent: 'danger' })}
        isDisabled={isPending}
        onPress={handleDelete}
      >
        {isPending ? <Loader /> : <IconTrashEmpty />}
      </Tooltip.Trigger>
      <Tooltip.Content>削除</Tooltip.Content>
    </Tooltip>
  )
}
