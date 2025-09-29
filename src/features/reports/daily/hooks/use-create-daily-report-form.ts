import { useControl } from '@conform-to/react/future'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useActionState } from 'react'
import { toast } from 'sonner'
import { ERROR_STATUS, TOAST_MESSAGES } from '~/constants'
import { createReportAction } from '~/features/reports/daily/actions/create-report-action'
import { useDailyReportSearchParams } from '~/features/reports/daily/hooks/use-daily-report-search-params'
import {
  type CreateDailyReportFormSchema,
  createDailyReportFormSchema,
} from '~/features/reports/daily/types/schemas/create-daily-report-form-schema'
import type { DailyInputCountSearchParams } from '~/features/reports/daily/types/search-params/input-count-search-params-cache'
import { useSafeForm } from '~/hooks/use-safe-form'
import { withCallbacks } from '~/utils/with-callbacks'

export function useCreateDailyForm(
  initialDailyInputCountSearchParamsParsers: DailyInputCountSearchParams,
) {
  const { reportEntry, appealsAndTroublesEntry, setReportEntry } = useDailyReportSearchParams(
    initialDailyInputCountSearchParamsParsers,
  )

  const router = useRouter()

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(createReportAction, {
      onError(result) {
        if (result.error) {
          const errorMessage = result.error.message

          if (errorMessage?.includes(ERROR_STATUS.UNAUTHORIZED)) {
            toast.error(TOAST_MESSAGES.UNAUTHORIZED, {
              cancel: {
                label: 'ログイン',
                onClick: () => router.push('/sign-in'),
              },
            })
            return
          }

          if (errorMessage?.includes(TOAST_MESSAGES.DAILY_REPORT_ALREADY_EXISTS)) {
            toast.error(TOAST_MESSAGES.DAILY_REPORT_ALREADY_EXISTS, {
              cancel: {
                label: '日報一覧へ',
                onClick: () => router.push('/mine'),
              },
            })
            return
          }
        }

        toast.error(TOAST_MESSAGES.CREATE_DAILY_REPORT_FAILED)
      },
    }),
    null,
  )

  const [form, fields] = useSafeForm<CreateDailyReportFormSchema>({
    constraint: getZodConstraint(createDailyReportFormSchema),
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: createDailyReportFormSchema })
    },
    defaultValue: {
      reportDate: format(new Date(), 'yyyy-MM-dd'),
      remote: undefined,
      impression: '',
      reportEntries: reportEntry.entries.map((entry) => ({
        ...entry,
        project: entry.project ?? '',
        mission: entry.mission ?? '',
        hours: entry.hours.toString(),
      })),
      appealEntries: appealsAndTroublesEntry.appeals.entries.map((entry) => ({
        id: entry.id,
        categoryId: entry.item ?? undefined,
        content: entry.content ?? undefined,
      })),
      troubleEntries: appealsAndTroublesEntry.troubles.entries.map((entry) => ({
        id: entry.id,
        categoryId: entry.item ?? undefined,
        content: entry.content ?? undefined,
      })),
    },
  })

  const reportDate = useControl({
    defaultValue: fields.reportDate.initialValue,
  })

  // Conformによるformの増減等状態管理は以下を参照
  // ? https://zenn.dev/coji/articles/remix-conform-nested-array
  // ? https://github.com/techtalkjp/techtalk.jp/blob/main/app/routes/demo+/conform.nested-array/route.tsx
  // ? https://www.techtalk.jp/demo/conform/nested-array
  const dailyReports = fields.reportEntries.getFieldList()

  const totalHours = dailyReports.reduce((acc, entry) => {
    const hours = Number(entry.value?.hours ?? 0)
    return acc + (hours > 0 ? hours : 0)
  }, 0)

  const handleAdd = () => {
    const newEntry = {
      id: crypto.randomUUID(),
      project: null,
      mission: null,
      content: '',
      hours: 0,
    } as const satisfies (typeof reportEntry.entries)[number]

    setReportEntry((prev) => {
      if (!prev) {
        return prev
      }

      return {
        ...prev,
        reportEntry: {
          ...prev.reportEntry,
          count: prev.reportEntry.count + 1,
          entries: [...prev.reportEntry.entries, newEntry],
        },
      }
    })

    form.insert({
      name: fields.reportEntries.name,
      defaultValue: {
        ...newEntry,
        project: '',
        mission: '',
        hours: '0',
      },
    })
  }

  const handleRemove = (id: string) => {
    const index = dailyReports.findIndex((entry) => entry.value?.id === id)

    if (index === -1) {
      return
    }

    setReportEntry((prev) => {
      if (!prev) {
        return prev
      }

      const filteredEntries = prev.reportEntry.entries.filter((e) => e.id !== id)

      return {
        ...prev,
        reportEntry: {
          ...prev.reportEntry,
          count: prev.reportEntry.count > 1 ? prev.reportEntry.count - 1 : 1,
          entries: filteredEntries,
        },
      }
    })

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

    return
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
