import { useInputControl } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useRouter } from 'next/navigation'
import { useActionState } from 'react'
import { toast } from 'sonner'
import { updateReportAction } from '~/features/reports/daily/actions/update-report-action'
import type { getReportById } from '~/features/reports/daily/server/fetcher'
import {
  type UpdateDailyReportFormSchema,
  updateDailyReportFormSchema,
} from '~/features/reports/daily/types/schemas/edit-daily-report-form-schema'
import { useSafeForm } from '~/hooks/use-safe-form'
import { withCallbacks } from '~/utils/with-callbacks'

export function useEditDailyForm(initialData: Awaited<ReturnType<typeof getReportById>>) {
  const router = useRouter()

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(updateReportAction, {
      onError(result) {
        if (result.error) {
          const errorMessage = result.error.message

          if (errorMessage?.includes('Unauthorized')) {
            toast.error('セッションが切れました。再度ログインしてください', {
              cancel: {
                label: 'ログイン',
                onClick: () => router.push('/sign-in'),
              },
            })
            return
          }

          if (errorMessage?.includes('日報が見つからない')) {
            toast.error('日報が見つからないか、編集権限がありません', {
              cancel: {
                label: '一覧に戻る',
                onClick: () => router.push('/daily/mine'),
              },
            })
            return
          }
        }

        toast.error('日報の更新に失敗しました')
      },
      onSuccess() {
        toast.success('日報を更新しました')
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
      reportEntries: initialData.reportEntries.map((entry) => ({
        id: entry.id,
        project: entry.projectId,
        mission: entry.missionId,
        hours: entry.hours.toString(),
        content: entry.content,
      })),
      appealEntries: initialData.appealEntries,
      troubleEntries: initialData.troubleEntries,
    },
  })

  const reportDate = useInputControl(fields.reportDate)

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

  const handleRemove = (id: string) => {
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
        (msg) => !msg.includes('Unauthorized'),
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
    dailyReports,
    totalHours,
    handleAdd,
    handleRemove,
    getError,
  } as const
}
