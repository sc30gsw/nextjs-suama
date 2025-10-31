import { useInputControl } from '@conform-to/react'
import { useControl } from '@conform-to/react/future'
import { getZodConstraint, parseWithZod } from '@conform-to/zod/v4'
import { useRouter } from 'next/navigation'
import { useActionState } from 'react'
import { toast } from 'sonner'
import { RELOAD_DELAY } from '~/constants'
import { ERROR_STATUS, TOAST_MESSAGES } from '~/constants/error-message'
import { updateReportAction } from '~/features/reports/daily/actions/update-report-action'
import type { getDailyReportById } from '~/features/reports/daily/server/fetcher'
import {
  type UpdateDailyReportEntrySchema,
  type UpdateDailyReportFormSchema,
  updateDailyReportFormSchema,
} from '~/features/reports/daily/types/schemas/edit-daily-report-form-schema'
import { useSafeForm } from '~/hooks/use-safe-form'
import { isErrorStatus } from '~/utils'
import { withCallbacks } from '~/utils/with-callbacks'

export function useEditDailyForm(initialData: Awaited<ReturnType<typeof getDailyReportById>>) {
  const router = useRouter()

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(updateReportAction, {
      onSuccess(result) {
        const data = 'data' in result ? result.data : undefined
        const message = data?.isDraft
          ? TOAST_MESSAGES.DAILY_REPORT.UPDATE_DRAFT_SUCCESS
          : TOAST_MESSAGES.DAILY_REPORT.UPDATE_SUCCESS

        toast.success(message)

        // ?: use cache が experimental で revalidateTag が効かないため、強制的にリロードする。reloadだと、nuqsのstateと競合するため、replaceを使用。
        setTimeout(() => {
          window.location.replace(`/daily/edit/${initialData.id}`)
        }, RELOAD_DELAY)
      },

      onError(result) {
        const errorMessage = result?.error?.message?.[0]

        if (isErrorStatus(errorMessage)) {
          switch (errorMessage) {
            case ERROR_STATUS.UNAUTHORIZED:
              toast.error(TOAST_MESSAGES.AUTH.UNAUTHORIZED, {
                cancel: {
                  label: 'ログイン',
                  onClick: () => router.push('/sign-in'),
                },
              })

              return

            case ERROR_STATUS.NOT_FOUND:
              toast.error(TOAST_MESSAGES.DAILY_REPORT.NOT_FOUND, {
                cancel: {
                  label: '一覧に戻る',
                  onClick: () => router.push('/daily/mine'),
                },
              })

              return

            case ERROR_STATUS.FOR_BIDDEN:
              toast.error(TOAST_MESSAGES.DAILY_REPORT.FORBIDDEN, {
                cancel: {
                  label: '一覧に戻る',
                  onClick: () => router.push('/daily/mine'),
                },
              })

              return

            case ERROR_STATUS.INVALID_MISSION_RELATION:
              toast.error(TOAST_MESSAGES.MISSION.INVALID_RELATION)

              return
          }
        }

        toast.error(TOAST_MESSAGES.DAILY_REPORT.UPDATE_FAILED)
      },
    }),
    null,
  )

  const [form, fields] = useSafeForm<UpdateDailyReportFormSchema>({
    constraint: getZodConstraint(updateDailyReportFormSchema),
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: updateDailyReportFormSchema })
    },
    defaultValue: {
      reportId: initialData.id,
      reportDate: initialData.reportDate,
      remote: initialData.remote,
      impression: initialData.impression,
      reportEntries: initialData.reportEntries.map(
        (entry: Awaited<ReturnType<typeof getDailyReportById>>['reportEntries'][number]) => ({
          id: entry.id,
          project: entry.projectId,
          mission: entry.missionId,
          hours: entry.hours.toString(),
          content: entry.content,
        }),
      ),
      appealEntries: initialData.appealEntries,
      troubleEntries: initialData.troubleEntries,
    },
  })

  const reportDate = useControl({
    defaultValue: fields.reportDate.initialValue,
  })
  const remote = useInputControl(fields.remote)

  const dailyReports = fields.reportEntries.getFieldList()

  const totalHours = dailyReports.reduce((acc, entry) => {
    const hours = Number(entry.value?.hours ?? 0)
    return acc + (hours > 0 ? hours : 0)
  }, 0)

  const handleAdd = () => {
    const newEntry = {
      id: crypto.randomUUID(),
      project: '',
      mission: '',
      content: '',
      hours: 0,
    } as const satisfies UpdateDailyReportFormSchema['reportEntries'][number]

    form.insert({
      name: fields.reportEntries.name,
      defaultValue: newEntry,
    })
  }

  const handleRemove = (id: UpdateDailyReportEntrySchema['id']) => {
    const index = dailyReports.findIndex((entry) => entry.value?.id === id)

    if (index === -1) {
      return
    }

    form.remove({
      name: fields.reportEntries.name,
      index,
    })
  }

  const getError = () => {
    if (lastResult?.error && Array.isArray(lastResult.error.message)) {
      const filteredMessages = lastResult.error.message.filter(
        (msg) => !msg.includes(ERROR_STATUS.UNAUTHORIZED),
      )

      return filteredMessages.length > 0 ? filteredMessages.join(', ') : undefined
    }

    return undefined
  }

  return {
    action,
    isPending,
    form,
    fields,
    reportDate,
    remote,
    dailyReports,
    totalHours,
    handleAdd,
    handleRemove,
    getError,
  } as const
}
