import { getZodConstraint, parseWithZod } from '@conform-to/zod/v4'
import { useRouter } from 'next/navigation'
import { useActionState } from 'react'
import { toast } from 'sonner'
import { ERROR_STATUS, TOAST_MESSAGES } from '~/constants/error-message'
import { updateWeeklyReportAction } from '~/features/reports/weekly/actions/update-weekly-report-action'
import { useWeeklyReportSearchParams } from '~/features/reports/weekly/hooks/use-weekly-report-search-params'
import type { getWeeklyReportMissionsById } from '~/features/reports/weekly/server/fetcher'
import {
  type UpdateWeeklyReportFormSchema,
  type UpdateWeeklyReportSchema,
  updateWeeklyReportFormSchema,
} from '~/features/reports/weekly/types/schemas/update-weekly-report-form-schema'
import type { UpdateWeeklyInputCountSearchParams } from '~/features/reports/weekly/types/search-params/weekly-input-count-search-params-cache'
import { useSafeForm } from '~/hooks/use-safe-form'
import { urls } from '~/lib/urls'
import { isErrorStatus } from '~/utils'
import { withCallbacks } from '~/utils/with-callbacks'

export function useUpdateWeeklyReportForm(
  initialWeeklyInputCountSearchParamsParsers: UpdateWeeklyInputCountSearchParams,
  dates: string,
  weeklyReportId?: NonNullable<
    Awaited<ReturnType<typeof getWeeklyReportMissionsById>>['weeklyReport']
  >['id'],
) {
  const { weeklyReportEntry, setWeeklyReportEntry } = useWeeklyReportSearchParams(
    initialWeeklyInputCountSearchParamsParsers,
  )

  const router = useRouter()

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(updateWeeklyReportAction, {
      onSuccess() {
        toast.success(TOAST_MESSAGES.WEEKLY_REPORT.UPDATE_SUCCESS)
        router.push(urls.build({ route: '/weekly/list/[dates]', params: { dates } }).href)
      },
      onError(result) {
        const errorMessage = result?.error?.message?.[0]

        if (isErrorStatus(errorMessage)) {
          switch (errorMessage) {
            case ERROR_STATUS.UNAUTHORIZED:
              toast.error(TOAST_MESSAGES.AUTH.UNAUTHORIZED, {
                cancel: {
                  label: 'ログイン',
                  onClick: () => router.push(urls.href({ route: '/sign-in' })),
                },
              })

              return

            case ERROR_STATUS.NOT_FOUND:
              toast.error(TOAST_MESSAGES.WEEKLY_REPORT.NOT_FOUND, {
                cancel: {
                  label: '一覧に戻る',
                  onClick: () => router.push(urls.build({ route: '/weekly/list/[dates]', params: { dates } }).href),
                },
              })

              return

            case ERROR_STATUS.FOR_BIDDEN:
              toast.error(TOAST_MESSAGES.WEEKLY_REPORT.FORBIDDEN, {
                cancel: {
                  label: '一覧に戻る',
                  onClick: () => router.push(urls.build({ route: '/weekly/list/[dates]', params: { dates } }).href),
                },
              })

              return

            case ERROR_STATUS.INVALID_PROJECT_RELATION:
              toast.error(TOAST_MESSAGES.PROJECT.INVALID_RELATION)

              return

            case ERROR_STATUS.INVALID_MISSION_RELATION:
              toast.error(TOAST_MESSAGES.MISSION.INVALID_RELATION)

              return
          }
        }

        toast.error(TOAST_MESSAGES.WEEKLY_REPORT.UPDATE_FAILED)
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

  const handleRemove = (id: UpdateWeeklyReportSchema['id']) => {
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
        (msg) => !msg.includes(ERROR_STATUS.UNAUTHORIZED),
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
