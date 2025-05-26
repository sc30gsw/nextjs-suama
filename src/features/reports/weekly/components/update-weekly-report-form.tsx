'use client'

import { FormProvider, getFormProps, getInputProps } from '@conform-to/react'
import {
  IconMinus,
  IconPlus,
  IconSend3,
  IconTriangleExclamation,
} from '@intentui/icons'
import { parseAsJson } from 'nuqs'
import { use } from 'react'
import { find, pipe } from 'remeda'
import { Button } from '~/components/ui/intent-ui/button'
import { Form } from '~/components/ui/intent-ui/form'
import { Loader } from '~/components/ui/intent-ui/loader'
import { Separator } from '~/components/ui/intent-ui/separator'
import type { getMissions } from '~/features/report-contexts/missions/server/fetcher'
import type { getProjects } from '~/features/report-contexts/projects/server/fetcher'
import { TotalHours } from '~/features/reports/components/total-hours'
import { UpdateWeeklyReportContentInputEntries } from '~/features/reports/weekly/components/update-weekly-report-content-input-entries'
import { useUpdateWeeklyReportForm } from '~/features/reports/weekly/hooks/use-update-weekly-repor-form'
import type { getWeeklyReportMissionsById } from '~/features/reports/weekly/server/fetcher'
import { weeklyReportStateSchema } from '~/features/reports/weekly/types/search-params/weekly-input-count-search-params-cache'

type UpdateWeeklyReportFormProps = {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getProjects>>,
      Awaited<ReturnType<typeof getMissions>>,
    ]
  >
  weeklyReport: Exclude<
    Awaited<ReturnType<typeof getWeeklyReportMissionsById>>['weeklyReport'],
    undefined
  >
  dates: string
}

export function UpdateWeeklyReportForm({
  promises,
  weeklyReport,
  dates,
}: UpdateWeeklyReportFormProps) {
  const [projectsResponse, missionsResponse] = use(promises)

  const initialWeeklyInputCountSearchParamsParsers = {
    weeklyReportEntry: parseAsJson(weeklyReportStateSchema.parse).withDefault({
      count: weeklyReport.weeklyReportMissions.length,
      entries: weeklyReport.weeklyReportMissions.map((entry) => ({
        id: entry.id,
        project: pipe(
          projectsResponse.projects,
          find((project) =>
            project.missions.some((mission) => mission.id === entry.missionId),
          ),
          (project) => project?.id ?? '',
        ),
        mission: entry.missionId,
        content: entry.workContent,
        hours: entry.hours,
      })),
    }),
  }

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
  } = useUpdateWeeklyReportForm(
    initialWeeklyInputCountSearchParamsParsers,
    dates,
    weeklyReport.id,
  )

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
              initialWeeklyInputCountSearchParamsParsers={
                initialWeeklyInputCountSearchParamsParsers
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
