import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useRouter } from 'next/navigation'
import { useActionState } from 'react'
import { toast } from 'sonner'
import { updateWeeklyReportAction } from '~/features/reports/weekly/actions/update-weekly-report-action'
import { useWeeklyReportSearchParams } from '~/features/reports/weekly/hooks/use-weekly-report-search-params'
import type { getWeeklyReportMissionsById } from '~/features/reports/weekly/server/fetcher'
import {
  type UpdateWeeklyReportFormSchema,
  updateWeeklyReportFormSchema,
} from '~/features/reports/weekly/types/schemas/update-weekly-report-form-schema'
import type { UpdateWeeklyInputCountSearchParams } from '~/features/reports/weekly/types/search-params/weekly-input-count-search-params-cache'
import { useSafeForm } from '~/hooks/use-safe-form'
import { withCallbacks } from '~/utils/with-callbacks'

export function useUpdateWeeklyReportForm(
  initialWeeklyInputCountSearchParamsParsers: UpdateWeeklyInputCountSearchParams,
  dates: string,
  weeklyReportId: Exclude<
    Awaited<ReturnType<typeof getWeeklyReportMissionsById>>['weeklyReport'],
    undefined
  >['id'],
) {
  const { weeklyReportEntry, setWeeklyReportEntry } = useWeeklyReportSearchParams(
    initialWeeklyInputCountSearchParamsParsers,
  )

  const router = useRouter()

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(updateWeeklyReportAction, {
      onSuccess() {
        toast.success('週報の更新に成功しました')
        router.push(`/weekly/list/${dates}`)
      },
      onError(result) {
        if (result.error) {
          const isUnauthorized = result.error.message?.includes('Unauthorized')

          if (isUnauthorized) {
            toast.error('セッションが切れました。再度ログインしてください', {
              cancel: {
                label: 'ログイン',
                onClick: () => router.push('/sign-in'),
              },
            })
            return
          }
        }

        toast.error('週報の更新に失敗しました')
      },
    }),
    null,
  )

  const [form, fields] = useSafeForm<UpdateWeeklyReportFormSchema>({
    constraint: getZodConstraint(updateWeeklyReportFormSchema),
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: updateWeeklyReportFormSchema })
    },
    defaultValue: {
      weeklyReportId,
      weeklyReports: weeklyReportEntry.entries.map((entry) => ({
        ...entry,
        hours: entry.hours.toString(),
      })),
    },
  })

  // Conformによるformの増減等状態管理は以下を参照
  // ? https://zenn.dev/coji/articles/remix-conform-nested-array
  // ? https://github.com/techtalkjp/techtalk.jp/blob/main/app/routes/demo+/conform.nested-array/route.tsx
  // ? https://www.techtalk.jp/demo/conform/nested-array
  const weeklyReports = fields.weeklyReports.getFieldList()

  const totalHours = weeklyReports.reduce((acc, entry) => {
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
    } as const satisfies (typeof weeklyReportEntry.entries)[number]

    setWeeklyReportEntry((prev) => {
      if (!prev) {
        return prev
      }

      return {
        ...prev,
        weeklyReportEntry: {
          ...prev.weeklyReportEntry,
          count: prev.weeklyReportEntry.count + 1,
          entries: [...prev.weeklyReportEntry.entries, newEntry],
        },
      }
    })

    form.insert({
      name: fields.weeklyReports.name,
      defaultValue: {
        ...newEntry,
        hours: '0',
      },
    })
  }

  const handleRemove = (id: string) => {
    const index = weeklyReports.findIndex((entry) => entry.value?.id === id)

    if (index === -1) {
      return
    }

    setWeeklyReportEntry((prev) => {
      if (!prev) {
        return prev
      }

      const filteredEntries = prev.weeklyReportEntry.entries.filter((e) => e.id !== id)

      return {
        ...prev,
        weeklyReportEntry: {
          ...prev.weeklyReportEntry,
          count: prev.weeklyReportEntry.count > 1 ? prev.weeklyReportEntry.count - 1 : 1,
          entries: filteredEntries,
        },
      }
    })

    form.remove({
      name: fields.weeklyReports.name,
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

    return
  }

  return {
    action,
    isPending,
    form,
    fields,
    weeklyReports,
    totalHours,
    handleAdd,
    handleRemove,
    getError,
  } as const
}
