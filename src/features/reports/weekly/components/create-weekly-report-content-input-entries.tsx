import { type FieldName, getInputProps } from '@conform-to/react'
import type { InferResponseType } from 'hono'
import { parseAsBoolean, parseAsJson } from 'nuqs'
import type { JSX } from 'react'
import { useFormStatus } from 'react-dom'
import { filter, pipe } from 'remeda'
import { ComboBox } from '~/components/ui/intent-ui/combo-box'
import { NumberField } from '~/components/ui/intent-ui/number-field'
import { TextField } from '~/components/ui/intent-ui/text-field'
import { useCreateWeeklyReportContentInputEntries } from '~/features/reports/weekly/hooks/use-create-weekly-report-content-input-entries'
import type { getLastWeeklyReportMissions } from '~/features/reports/weekly/server/fetcher'
import type {
  CreateWeeklyReportFormSchema,
  CreateWeeklyReportSchema,
} from '~/features/reports/weekly/types/schemas/create-weekly-report-form-schema'
import {
  weeklyInputCountSearchParamsParsers,
  weeklyReportStateSchema,
} from '~/features/reports/weekly/types/search-params/weekly-input-count-search-params-cache'
import type { client } from '~/lib/rpc'

type CreateWeeklyReportContentInputEntriesProps = {
  id?: string
  projects: InferResponseType<typeof client.api.projects.$get, 200>['projects']
  missions: InferResponseType<typeof client.api.missions.$get, 200>['missions']
  lastWeeklyReportMissions?: Awaited<ReturnType<typeof getLastWeeklyReportMissions>>
  formId: string
  name: FieldName<CreateWeeklyReportSchema, CreateWeeklyReportFormSchema>
  removeButton: JSX.Element
}

export function CreateWeeklyReportContentInputEntries({
  id,
  projects,
  missions,
  lastWeeklyReportMissions,
  formId,
  name,
  removeButton,
}: CreateWeeklyReportContentInputEntriesProps) {
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
    field,
    missionInput,
    contentInput,
    hoursInput,
    projectId,
    missionId,
    handleChangeItem,
    handleChangeValue,
  } = useCreateWeeklyReportContentInputEntries(
    initialWeeklyInputCountSearchParamsParsers,
    formId,
    name,
    projects,
  )

  const { pending } = useFormStatus()

  return (
    <div className="mx-auto grid grid-cols-11 grid-rows-1 items-center gap-4 py-2">
      <input {...getInputProps(field.id, { type: 'hidden' })} />
      <div className="col-span-2">
        <ComboBox
          {...getInputProps(field.project, { type: 'text' })}
          label="プロジェクト"
          placeholder="プロジェクトを選択"
          onSelectionChange={(key) => {
            handleChangeItem(id ?? '', key, 'project')
          }}
          selectedKey={projectId}
          isDisabled={pending}
        >
          <ComboBox.Input />
          <ComboBox.List items={projects}>
            {(project) => <ComboBox.Option id={project.id}>{project.name}</ComboBox.Option>}
          </ComboBox.List>
        </ComboBox>
        <span id={field.project.errorId} className="text-red-500 text-sm">
          {field.project.errors}
        </span>
      </div>
      <div className="col-span-2">
        <ComboBox
          {...getInputProps(field.mission, { type: 'text' })}
          label="ミッション"
          placeholder="ミッションを選択"
          onSelectionChange={(key) => {
            handleChangeItem(id ?? '', key, 'mission')
          }}
          selectedKey={missionId}
          isDisabled={pending}
        >
          <ComboBox.Input />
          <ComboBox.List
            items={
              projectId && !missionInput.value
                ? pipe(
                    missions,
                    filter((mission) => mission.projectId === projectId),
                  )
                : missions
            }
          >
            {(mission) => <ComboBox.Option id={mission.id}>{mission.name}</ComboBox.Option>}
          </ComboBox.List>
        </ComboBox>
        <span id={field.mission.errorId} className="text-red-500 text-sm">
          {field.mission.errors}
        </span>
      </div>
      <div className="col-span-2">
        <NumberField
          step={0.25}
          label="時間"
          value={Number(hoursInput.value)}
          onChange={(val) => handleChangeValue(id ?? '', val)}
          errorMessage={''}
          isDisabled={pending}
        />
        <span id={field.hours.errorId} className="text-red-500 text-sm">
          {field.hours.errors}
        </span>
      </div>
      <div className="col-span-4">
        <TextField
          {...getInputProps(field.content, { type: 'text' })}
          label="内容"
          placeholder="タスク内容を入力"
          value={contentInput.value}
          onChange={(val) => {
            handleChangeValue(id ?? '', val)
          }}
          isDisabled={pending}
          errorMessage={''}
        />
        <span id={field.content.errorId} className="text-red-500 text-sm">
          {field.content.errors}
        </span>
      </div>
      <div className="col-span-1">{removeButton}</div>
    </div>
  )
}
