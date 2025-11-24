'use client'

import { FormProvider, getFormProps, getInputProps } from '@conform-to/react'
import { IconMinus, IconPlus, IconSend3, IconTriangleExclamation } from '@intentui/icons'
import { parseAsBoolean, parseAsJson } from 'nuqs'
import { use } from 'react'
import { Button, buttonStyles } from '~/components/ui/intent-ui/button'
import { Form } from '~/components/ui/intent-ui/form'
import { Loader } from '~/components/ui/intent-ui/loader'
import { Separator } from '~/components/ui/intent-ui/separator'
import { Tooltip } from '~/components/ui/intent-ui/tooltip'
import type { getMissions } from '~/features/report-contexts/missions/server/fetcher'
import type { getProjects } from '~/features/report-contexts/projects/server/fetcher'
import { TotalHours } from '~/features/reports/components/total-hours'
import { CreateWeeklyReportContentInputEntries } from '~/features/reports/weekly/components/create-weekly-report-content-input-entries'
import { useCreateWeeklyForm } from '~/features/reports/weekly/hooks/use-create-weekly-report-form'
import type { getLastWeeklyReportMissions } from '~/features/reports/weekly/server/fetcher'
import {
  weeklyInputCountSearchParamsParsers,
  weeklyReportStateSchema,
} from '~/features/reports/weekly/types/search-params/weekly-input-count-search-params-cache'
import { cn } from '~/utils/classes'

type CreateWeeklyReportFormProps = {
  promises: Promise<
    [Awaited<ReturnType<typeof getProjects>>, Awaited<ReturnType<typeof getMissions>>]
  >
  lastWeeklyReportMissions?: Awaited<ReturnType<typeof getLastWeeklyReportMissions>>
  date: {
    dates: string
    year: number
    week: number
  }
}

export function CreateWeeklyReportForm({
  promises,
  lastWeeklyReportMissions,
  date,
}: CreateWeeklyReportFormProps) {
  const [projectsResponse, missionsResponse] = use(promises)

  const initialWeeklyInputCountSearchParamsParsers = lastWeeklyReportMissions?.weeklyReport
    ? {
        weeklyReportEntry: parseAsJson(weeklyReportStateSchema.parse).withDefault({
          count: lastWeeklyReportMissions.weeklyReport.weeklyReportMissions.length,
          entries: lastWeeklyReportMissions.weeklyReport.weeklyReportMissions.map(
            (weeklyReportMission) => ({
              id: weeklyReportMission.id,
              project: weeklyReportMission.mission.projectId,
              mission: weeklyReportMission.missionId,
              hours: weeklyReportMission.hours,
              content: weeklyReportMission.workContent,
            }),
          ),
        }),
        isReference: parseAsBoolean.withDefault(false),
      }
    : weeklyInputCountSearchParamsParsers

  const {
    action,
    isPending,
    form,
    fields,
    weeklyReports,
    totalHours,
    handleAdd,
    handleRemove,
    getError,
  } = useCreateWeeklyForm(initialWeeklyInputCountSearchParamsParsers, date)

  return (
    <>
      <div className="space-y-2">
        {fields.weeklyReports.errors && (
          <div className="flex items-center gap-x-2 rounded-md bg-danger/15 p-3 text-danger text-sm">
            <IconTriangleExclamation className="size-4" />
            <p>{fields.weeklyReports.errors}</p>
          </div>
        )}
        {getError() && (
          <div className="flex items-center gap-x-2 rounded-md bg-danger/15 p-3 text-danger text-sm">
            <IconTriangleExclamation className="size-4" />
            <p>{getError()}</p>
          </div>
        )}
        <Tooltip delay={0}>
          <Tooltip.Trigger
            className={cn(buttonStyles({ size: 'sq-sm', isCircle: true }), 'mt-4')}
            onPress={handleAdd}
            isDisabled={isPending}
          >
            <IconPlus />
          </Tooltip.Trigger>
          <Tooltip.Content>職務内容を追加</Tooltip.Content>
        </Tooltip>
      </div>
      <FormProvider context={form.context}>
        <Form className="space-y-2" action={action} {...getFormProps(form)}>
          <input {...getInputProps(fields.year, { type: 'hidden' })} />
          <input {...getInputProps(fields.week, { type: 'hidden' })} />
          {weeklyReports.map((weeklyReport) => (
            <CreateWeeklyReportContentInputEntries
              key={weeklyReport.key}
              id={weeklyReport.value?.id}
              formId={form.id}
              name={weeklyReport.name}
              projects={projectsResponse.projects}
              missions={missionsResponse.missions}
              lastWeeklyReportMissions={lastWeeklyReportMissions}
              removeButton={
                <Tooltip delay={0}>
                  <Tooltip.Trigger
                    className={cn(
                      buttonStyles({ size: 'sq-sm', intent: 'danger', isCircle: true }),
                      'mt-6',
                    )}
                    onPress={() => {
                      handleRemove(weeklyReport.getFieldset().id.value ?? '')
                    }}
                    isDisabled={isPending}
                  >
                    <IconMinus />
                  </Tooltip.Trigger>
                  <Tooltip.Content>職務内容を削除</Tooltip.Content>
                </Tooltip>
              }
            />
          ))}

          {weeklyReports.length >= 1 && (
            <Tooltip delay={0}>
              <Tooltip.Trigger
                className={cn(buttonStyles({ size: 'sq-sm', isCircle: true }), 'mt-4')}
                onPress={handleAdd}
                isDisabled={isPending}
              >
                <IconPlus />
              </Tooltip.Trigger>
              <Tooltip.Content>職務内容を追加</Tooltip.Content>
            </Tooltip>
          )}

          <Separator orientation="horizontal" />
          <TotalHours totalHours={totalHours} />
          <Separator orientation="horizontal" />
          <div className="my-4 flex items-center justify-end gap-x-2">
            <Button isDisabled={isPending} type="submit">
              {isPending ? '登録中...' : '登録する'}
              {isPending ? <Loader /> : <IconSend3 />}
            </Button>
          </div>
        </Form>
      </FormProvider>
    </>
  )
}
