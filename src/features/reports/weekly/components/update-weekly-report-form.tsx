'use client'

import { FormProvider, getFormProps, getInputProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
  IconMinus,
  IconPlus,
  IconSend3,
  IconTriangleExclamation,
} from '@intentui/icons'
import { useParams, useRouter } from 'next/navigation'
import { parseAsJson, useQueryStates } from 'nuqs'
import { use, useActionState } from 'react'
import { find, pipe } from 'remeda'
import { toast } from 'sonner'
import { Button } from '~/components/ui/intent-ui/button'
import { Form } from '~/components/ui/intent-ui/form'
import { Loader } from '~/components/ui/intent-ui/loader'
import { Separator } from '~/components/ui/intent-ui/separator'
import type { getMissions } from '~/features/report-contexts/missions/server/fetcher'
import type { getProjects } from '~/features/report-contexts/projects/server/fetcher'
import { TotalHours } from '~/features/reports/components/total-hours'
import { updateWeeklyReportAction } from '~/features/reports/weekly/actions/update-weekly-report-action'
import { UpdateWeeklyReportContentInputEntries } from '~/features/reports/weekly/components/update-weekly-report-content-input-entries'
import type { getWeeklyReportMissions } from '~/features/reports/weekly/server/fetcher'
import {
  type UpdateWeeklyReportFormSchema,
  updateWeeklyReportFormSchema,
} from '~/features/reports/weekly/types/schemas/update-weekly-report-form-schema'
import { weeklyReportStateSchema } from '~/features/reports/weekly/types/search-params/weekly-input-count-search-params-cache'
import { useSafeForm } from '~/hooks/use-safe-form'
import { withCallbacks } from '~/utils/with-callbacks'

type UpdateWeeklyReportFormProps = {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getProjects>>,
      Awaited<ReturnType<typeof getMissions>>,
    ]
  >
  weeklyReport: Exclude<
    Awaited<ReturnType<typeof getWeeklyReportMissions>>['weeklyReport'],
    undefined
  >
}

export function UpdateWeeklyReportForm({
  promises,
  weeklyReport,
}: UpdateWeeklyReportFormProps) {
  const [projectsResponse, missionsResponse] = use(promises)

  const router = useRouter()
  const { dates } = useParams<Record<'dates', string>>()

  const [{ weeklyReportEntry }, setWeeklyReportEntry] = useQueryStates(
    {
      weeklyReportEntry: parseAsJson(weeklyReportStateSchema.parse).withDefault(
        {
          count: weeklyReport.weeklyReportMissions.length,
          entries: weeklyReport.weeklyReportMissions.map((entry) => ({
            id: entry.id,
            project: pipe(
              projectsResponse.projects,
              find((project) =>
                project.missions.some(
                  (mission) => mission.id === entry.missionId,
                ),
              ),
              (project) => project?.id ?? '',
            ),
            mission: entry.missionId,
            content: entry.workContent,
            hours: entry.hours,
          })),
        },
      ),
    },
    {
      history: 'push',
      shallow: false,
    },
  )

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
      weeklyReportId: weeklyReport.id,
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

      const filteredEntries = prev.weeklyReportEntry.entries.filter(
        (e) => e.id !== id,
      )

      return {
        ...prev,
        weeklyReportEntry: {
          ...prev.weeklyReportEntry,
          count:
            prev.weeklyReportEntry.count > 1
              ? prev.weeklyReportEntry.count - 1
              : 1,
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

      return filteredMessages.length > 0
        ? filteredMessages.join(', ')
        : undefined
    }

    return
  }

  return (
    <>
      <div className="space-y-2">
        {fields.weeklyReports.errors && (
          <div className="bg-danger/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-danger">
            <IconTriangleExclamation className="size-4" />
            <p>{fields.weeklyReports.errors}</p>
          </div>
        )}
        {getError() && (
          <div className="bg-danger/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-danger">
            <IconTriangleExclamation className="size-4" />
            <p>{getError()}</p>
          </div>
        )}
        <Button
          size="square-petite"
          onPress={handleAdd}
          className="rounded-full mt-4"
          isDisabled={isPending}
        >
          <IconPlus />
        </Button>
      </div>
      <FormProvider context={form.context}>
        <Form className="space-y-2" action={action} {...getFormProps(form)}>
          <input
            {...getInputProps(fields.weeklyReportId, { type: 'hidden' })}
          />
          {weeklyReports.map((weeklyReport) => (
            <UpdateWeeklyReportContentInputEntries
              key={weeklyReport.key}
              id={weeklyReport.value?.id}
              formId={form.id}
              name={weeklyReport.name}
              projects={projectsResponse.projects}
              missions={missionsResponse.missions}
              removeButton={
                <Button
                  size="square-petite"
                  intent="danger"
                  onPress={() => {
                    handleRemove(weeklyReport.getFieldset().id.value ?? '')
                  }}
                  isDisabled={isPending}
                  className="rounded-full mt-6"
                >
                  <IconMinus />
                </Button>
              }
            />
          ))}
          <Separator orientation="horizontal" />
          <TotalHours totalHours={totalHours} />
          <Separator orientation="horizontal" />
          <div className="flex items-center justify-end gap-x-2 my-4">
            <Button isDisabled={isPending} type="submit">
              {isPending ? '更新中...' : '更新する'}
              {isPending ? <Loader /> : <IconSend3 />}
            </Button>
          </div>
        </Form>
      </FormProvider>
    </>
  )
}
