import { useInputControl } from '@conform-to/react'
import { useControl } from '@conform-to/react/future'
import { getZodConstraint, parseWithZod } from '@conform-to/zod/v4'
import { useRouter } from 'next/navigation'
import { useActionState } from 'react'
import { toast } from 'sonner'
import { ERROR_STATUS, TOAST_MESSAGES } from '~/constants/error-message'
import { updateReportAction } from '~/features/reports/daily/actions/update-report-action'
import { useDailyReportSearchParams } from '~/features/reports/daily/hooks/use-daily-report-search-params'
import type { getDailyReportById } from '~/features/reports/daily/server/fetcher'
import type { TroubleCategoriesResponse } from '~/features/reports/daily/types/api-response'
import {
  type UpdateDailyReportEntrySchema,
  type UpdateDailyReportFormSchema,
  updateDailyReportFormSchema,
} from '~/features/reports/daily/types/schemas/edit-daily-report-form-schema'
import type { DailyInputCountSearchParams } from '~/features/reports/daily/types/search-params/input-count-search-params-cache'
import { useSafeForm } from '~/hooks/use-safe-form'
import { urls } from '~/lib/urls'
import { isErrorStatus } from '~/utils'
import { withCallbacks } from '~/utils/with-callbacks'

export function useEditDailyForm(
  initialData: Awaited<ReturnType<typeof getDailyReportById>>,
  initialDailyInputCountSearchParamsParsers: DailyInputCountSearchParams,
  options: Partial<
    Record<'unResolvedTroubles', TroubleCategoriesResponse['unResolvedTroubles']>
  > = {},
) {
  const { unResolvedTroubles = [] } = options

  const { reportEntry, appealsAndTroublesEntry, remote, impression, setReportEntry } =
    useDailyReportSearchParams(initialDailyInputCountSearchParamsParsers)

  const router = useRouter()

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(updateReportAction, {
      onSuccess(result) {
        const data = 'data' in result ? result.data : undefined
        const message = data?.isDraft
          ? TOAST_MESSAGES.DAILY_REPORT.UPDATE_DRAFT_SUCCESS
          : TOAST_MESSAGES.DAILY_REPORT.UPDATE_SUCCESS

        toast.success(message)

        router.push(urls.href({ route: '/daily/mine' }))
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
              toast.error(TOAST_MESSAGES.DAILY_REPORT.NOT_FOUND, {
                cancel: {
                  label: '一覧に戻る',
                  onClick: () => router.push(urls.href({ route: '/daily/mine' })),
                },
              })

              return

            case ERROR_STATUS.FOR_BIDDEN:
              toast.error(TOAST_MESSAGES.DAILY_REPORT.FORBIDDEN, {
                cancel: {
                  label: '一覧に戻る',
                  onClick: () => router.push(urls.href({ route: '/daily/mine' })),
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

  // nuqsから初期値を構築（createフォームと同じパターン）
  // nuqsのデフォルト値は親コンポーネントで既存データに設定されている
  const initialTroubleEntries: UpdateDailyReportFormSchema['troubleEntries'] = [
    // 既存の未解決トラブル（サーバーから取得、nuqsには含まれない）
    ...unResolvedTroubles
      .filter(
        (trouble) =>
          !initialData.troubleEntries.some((e) => e.id === trouble.id) &&
          !appealsAndTroublesEntry.troubles.entries.some((e) => e.id === trouble.id),
      )
      .map((trouble) => ({
        id: trouble.id,
        categoryId: trouble.categoryOfTroubleId,
        content: trouble.trouble,
        resolved: trouble.resolved,
        isExisting: true,
      })),
    ...appealsAndTroublesEntry.troubles.entries.map((entry) => {
      const isExisting =
        unResolvedTroubles.some((t) => t.id === entry.id) ||
        initialData.troubleEntries.some((t) => t.id === entry.id)

      return {
        id: entry.id,
        categoryId: entry.item ?? undefined,
        content: entry.content,
        resolved: entry.resolved ?? false,
        isExisting,
      }
    }),
  ]

  const initialAppealEntries: UpdateDailyReportFormSchema['appealEntries'] =
    appealsAndTroublesEntry.appeals.entries.map((entry) => ({
      id: entry.id,
      categoryId: entry.item ?? undefined,
      content: entry.content,
    }))

  const initialReportEntries = reportEntry.entries.map((entry) => ({
    id: entry.id,
    project: entry.project ?? '',
    mission: entry.mission ?? '',
    hours: entry.hours.toString(),
    content: entry.content,
  }))

  const [form, fields] = useSafeForm<UpdateDailyReportFormSchema>({
    constraint: getZodConstraint(updateDailyReportFormSchema),
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: updateDailyReportFormSchema })
    },
    defaultValue: {
      reportId: initialData.id,
      reportDate: initialData.reportDate,
      remote,
      impression,
      reportEntries: initialReportEntries,
      appealEntries: initialAppealEntries,
      troubleEntries: initialTroubleEntries,
    },
  })

  const reportDate = useControl({
    defaultValue: fields.reportDate.initialValue,
  })

  const remoteInput = useInputControl(fields.remote)
  const impressionInput = useInputControl(fields.impression)

  const dailyReports = fields.reportEntries.getFieldList()
  const appealEntries = fields.appealEntries.getFieldList()
  const troubleEntries = fields.troubleEntries.getFieldList()

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
      defaultValue: newEntry,
    })
  }

  const handleRemove = (id: UpdateDailyReportEntrySchema['id']) => {
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

  const handleAddAppeal = () => {
    const newEntry = {
      id: crypto.randomUUID(),
      content: '',
      item: null,
    } as const

    setReportEntry((prev) => {
      if (!prev) {
        return prev
      }

      return {
        ...prev,
        appealsAndTroublesEntry: {
          ...prev.appealsAndTroublesEntry,
          appeals: {
            count: prev.appealsAndTroublesEntry.appeals.count + 1,
            entries: [...prev.appealsAndTroublesEntry.appeals.entries, newEntry],
          },
        },
      }
    })

    form.insert({
      name: fields.appealEntries.name,
      defaultValue: {
        id: newEntry.id,
        categoryId: undefined,
        content: '',
      },
    })
  }

  const handleRemoveAppeal = (index: number) => {
    const entry = appealEntries[index]
    const entryId = entry?.value?.id ?? entry?.initialValue?.id

    setReportEntry((prev) => {
      if (!prev) {
        return prev
      }

      const filteredEntries = prev.appealsAndTroublesEntry.appeals.entries.filter(
        (e) => e.id !== entryId,
      )

      return {
        ...prev,
        appealsAndTroublesEntry: {
          ...prev.appealsAndTroublesEntry,
          appeals: {
            count: filteredEntries.length,
            entries: filteredEntries,
          },
        },
      }
    })

    form.remove({
      name: fields.appealEntries.name,
      index,
    })
  }

  const handleAddTrouble = () => {
    const newEntry = {
      id: crypto.randomUUID(),
      content: '',
      item: null,
      resolved: false,
    } as const

    setReportEntry((prev) => {
      if (!prev) {
        return prev
      }

      return {
        ...prev,
        appealsAndTroublesEntry: {
          ...prev.appealsAndTroublesEntry,
          troubles: {
            count: prev.appealsAndTroublesEntry.troubles.count + 1,
            entries: [...prev.appealsAndTroublesEntry.troubles.entries, newEntry],
          },
        },
      }
    })

    form.insert({
      name: fields.troubleEntries.name,
      defaultValue: {
        id: newEntry.id,
        categoryId: undefined,
        content: '',
        resolved: false,
        isExisting: false,
      },
    })
  }

  const handleRemoveTrouble = (index: number) => {
    const entry = troubleEntries[index]
    const entryId = entry?.value?.id ?? entry?.initialValue?.id
    const isExisting = entry?.value?.isExisting ?? entry?.initialValue?.isExisting

    if (!isExisting) {
      setReportEntry((prev) => {
        if (!prev) {
          return prev
        }

        const filteredEntries = prev.appealsAndTroublesEntry.troubles.entries.filter(
          (e) => e.id !== entryId,
        )

        return {
          ...prev,
          appealsAndTroublesEntry: {
            ...prev.appealsAndTroublesEntry,
            troubles: {
              count: filteredEntries.length,
              entries: filteredEntries,
            },
          },
        }
      })
    }

    form.remove({
      name: fields.troubleEntries.name,
      index,
    })
  }

  const handleChangeAppealContent = (id: string, content: string) => {
    setReportEntry((prev) => {
      if (!prev) {
        return prev
      }

      const updatedEntries = prev.appealsAndTroublesEntry.appeals.entries.map((entry) =>
        entry.id === id ? { ...entry, content } : entry,
      )

      return {
        ...prev,
        appealsAndTroublesEntry: {
          ...prev.appealsAndTroublesEntry,
          appeals: {
            ...prev.appealsAndTroublesEntry.appeals,
            entries: updatedEntries,
          },
        },
      }
    })
  }

  const handleChangeAppealCategory = (id: string, categoryId: string | null) => {
    setReportEntry((prev) => {
      if (!prev) {
        return prev
      }

      const updatedEntries = prev.appealsAndTroublesEntry.appeals.entries.map((entry) =>
        entry.id === id ? { ...entry, item: categoryId } : entry,
      )

      return {
        ...prev,
        appealsAndTroublesEntry: {
          ...prev.appealsAndTroublesEntry,
          appeals: {
            ...prev.appealsAndTroublesEntry.appeals,
            entries: updatedEntries,
          },
        },
      }
    })
  }

  const handleChangeTroubleContent = (id: string, content: string) => {
    setReportEntry((prev) => {
      if (!prev) {
        return prev
      }

      const updatedEntries = prev.appealsAndTroublesEntry.troubles.entries.map((entry) =>
        entry.id === id ? { ...entry, content } : entry,
      )

      return {
        ...prev,
        appealsAndTroublesEntry: {
          ...prev.appealsAndTroublesEntry,
          troubles: {
            ...prev.appealsAndTroublesEntry.troubles,
            entries: updatedEntries,
          },
        },
      }
    })
  }

  const handleChangeTroubleCategory = (id: string, categoryId: string | null) => {
    setReportEntry((prev) => {
      if (!prev) {
        return prev
      }

      const updatedEntries = prev.appealsAndTroublesEntry.troubles.entries.map((entry) =>
        entry.id === id ? { ...entry, item: categoryId } : entry,
      )

      return {
        ...prev,
        appealsAndTroublesEntry: {
          ...prev.appealsAndTroublesEntry,
          troubles: {
            ...prev.appealsAndTroublesEntry.troubles,
            entries: updatedEntries,
          },
        },
      }
    })
  }

  const handleChangeRemote = (isSelected: UpdateDailyReportFormSchema['remote']) => {
    setReportEntry({ remote: isSelected })

    remoteInput.change(isSelected ? 'on' : undefined)
  }

  const handleChangeImpression = (value: UpdateDailyReportFormSchema['impression']) => {
    setReportEntry({ impression: value ?? '' })

    impressionInput.change(value)
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
    remoteInput,
    impressionInput,
    dailyReports,
    appealEntries,
    troubleEntries,
    totalHours,
    handleAdd,
    handleRemove,
    handleAddAppeal,
    handleRemoveAppeal,
    handleAddTrouble,
    handleRemoveTrouble,
    handleChangeAppealContent,
    handleChangeAppealCategory,
    handleChangeTroubleContent,
    handleChangeTroubleCategory,
    handleChangeRemote,
    handleChangeImpression,
    getError,
  } as const
}
