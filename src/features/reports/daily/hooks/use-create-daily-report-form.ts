import { useInputControl } from '@conform-to/react'
import { useControl } from '@conform-to/react/future'
import { getZodConstraint, parseWithZod } from '@conform-to/zod/v4'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useActionState } from 'react'
import { toast } from 'sonner'
import { RELOAD_DELAY } from '~/constants'
import { ERROR_STATUS, TOAST_MESSAGES } from '~/constants/error-message'
import { createReportAction } from '~/features/reports/daily/actions/create-report-action'
import { useDailyReportSearchParams } from '~/features/reports/daily/hooks/use-daily-report-search-params'
import {
  type CreateDailyReportFormSchema,
  createDailyReportFormSchema,
  type DailyReportEntrySchema,
} from '~/features/reports/daily/types/schemas/create-daily-report-form-schema'
import type { DailyInputCountSearchParams } from '~/features/reports/daily/types/search-params/input-count-search-params-cache'
import { useSafeForm } from '~/hooks/use-safe-form'
import { urls } from '~/lib/urls'
import { isErrorStatus } from '~/utils'
import { DATE_FORMAT } from '~/utils/date-utils'
import { withCallbacks } from '~/utils/with-callbacks'

export function useCreateDailyForm(
  initialDailyInputCountSearchParamsParsers: DailyInputCountSearchParams,
) {
  const { reportEntry, appealsAndTroublesEntry, remote, impression, setReportEntry } =
    useDailyReportSearchParams(initialDailyInputCountSearchParamsParsers)

  const router = useRouter()

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(createReportAction, {
      onSuccess(result) {
        const data = 'data' in result ? result.data : undefined
        const message = data?.isDraft
          ? `${data.reportDate}の${TOAST_MESSAGES.DAILY_REPORT.CREATE_DRAFT_SUCCESS}`
          : `${data?.reportDate}の${TOAST_MESSAGES.DAILY_REPORT.CREATE_SUCCESS}`

        toast.success(message)

        // ?: use cache が experimental で revalidateTag が効かないため、強制的にリロードする。reloadだと、nuqsのstateと競合するため、replaceを使用。
        setTimeout(() => {
          window.location.replace('/daily')
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
                  onClick: () => router.push(urls.href({ route: '/sign-in' })),
                },
              })

              return

            case ERROR_STATUS.ALREADY_EXISTS:
              toast.error(TOAST_MESSAGES.DAILY_REPORT.ALREADY_EXISTS, {
                cancel: {
                  label: '日報一覧へ',
                  onClick: () => router.push(urls.href({ route: '/daily/mine' })),
                },
              })

              return

            case ERROR_STATUS.INVALID_MISSION_RELATION:
              toast.error(TOAST_MESSAGES.MISSION.INVALID_RELATION)

              return
          }
        }

        toast.error(TOAST_MESSAGES.DAILY_REPORT.CREATE_FAILED)
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
      reportDate: format(new Date(), DATE_FORMAT),
      remote,
      impression,
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

  const remoteInput = useInputControl(fields.remote)
  const impressionInput = useInputControl(fields.impression)

  // ?: reportDate は useInputControl を使用すると不具合が発生したため、、useControl を使用
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

  const handleRemove = (id: DailyReportEntrySchema['id']) => {
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

  const handleChangeRemote = (isSelected: CreateDailyReportFormSchema['remote']) => {
    setReportEntry({ remote: isSelected })

    remoteInput.change(isSelected ? 'on' : undefined)
  }

  const handleChangeImpression = (value: CreateDailyReportFormSchema['impression']) => {
    setReportEntry({ impression: value })

    impressionInput.change(value)
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
    remoteInput,
    impressionInput,
    dailyReports,
    totalHours,
    handleAdd,
    handleRemove,
    handleChangeRemote,
    handleChangeImpression,
    getError,
  } as const
}
