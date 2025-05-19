import {
  type FieldName,
  getInputProps,
  useField,
  useInputControl,
} from '@conform-to/react'
import type { InferResponseType } from 'hono'
import { useQueryStates } from 'nuqs'
import { type JSX, useState } from 'react'
import type { Key } from 'react-aria-components'
import { useFormStatus } from 'react-dom'
import { filter, find, pipe } from 'remeda'
import { ComboBox } from '~/components/ui/intent-ui/combo-box'
import { NumberField } from '~/components/ui/intent-ui/number-field'
import { TextField } from '~/components/ui/intent-ui/text-field'
import type {
  CreateWeeklyReportFormSchema,
  CreateWeeklyReportSchema,
} from '~/features/reports/weekly/types/schemas/create-weekly-report-form-schema'
import { weeklyInputCountSearchParamsParsers } from '~/features/reports/weekly/types/search-params/weekly-input-count-search-params-cache'
import type { client } from '~/lib/rpc'

type CreateWeeklyReportContentInputEntriesProps = {
  id?: string
  projects: InferResponseType<typeof client.api.projects.$get, 200>['projects']
  missions: InferResponseType<typeof client.api.missions.$get, 200>['missions']
  formId: string
  name: FieldName<CreateWeeklyReportSchema, CreateWeeklyReportFormSchema>
  removeButton: JSX.Element
}

export function CreateWeeklyReportContentInputEntries({
  id,
  projects,
  missions,
  formId,
  name,
  removeButton,
}: CreateWeeklyReportContentInputEntriesProps) {
  const [meta] = useField(name, { formId })
  const field = meta.getFieldset()
  const projectInput = useInputControl(field.project)
  const missionInput = useInputControl(field.mission)

  const contentInput = useInputControl(field.content)
  const hoursInput = useInputControl(field.hours)

  const { pending } = useFormStatus()

  // form resetがConformのものでは反映されないため
  const [projectId, setProjectId] = useState<Key | null>(
    projectInput.value ?? null,
  )
  const [missionId, setMissionId] = useState<Key | null>(
    missionInput.value ?? null,
  )

  const [, setWeeklyReportEntry] = useQueryStates(
    weeklyInputCountSearchParamsParsers,
    {
      history: 'push',
      shallow: false,
    },
  )

  const handleChangeItem = (
    id: string,
    newItem: Key | null,
    kind: 'project' | 'mission',
  ) => {
    if (!(id && newItem)) {
      return
    }

    setWeeklyReportEntry((prev) => {
      if (!prev) {
        return prev
      }

      const updatedEntries = prev.weeklyReportEntry.entries.map((e) =>
        e.id === id ? { ...e, [kind]: newItem } : e,
      )

      return {
        ...prev,
        weeklyReportEntry: {
          ...prev.weeklyReportEntry,
          entries: updatedEntries,
        },
      }
    })

    if (kind === 'project') {
      setProjectId(newItem)
      projectInput.change(newItem.toString())
    } else {
      missionId
        ? pipe(
            projects,
            filter((project) =>
              project.missions.some((mission) => mission.id === missionId),
            ),
          )
        : projects
      setMissionId(newItem)
      missionInput.change(newItem.toString())

      const findProject = pipe(
        projects,
        find((project) =>
          project.missions.some((mission) => mission.id === newItem),
        ),
      )

      setProjectId(findProject?.id ?? null)
      projectInput.change(findProject?.id.toString() ?? '')
    }
  }

  const handleChangeValue = (id: string, newValue: string | number) => {
    if (!id) {
      return
    }

    setWeeklyReportEntry((prev) => {
      if (!prev) {
        return prev
      }

      const key = typeof newValue === 'string' ? 'content' : 'hours'
      const updatedEntries = prev.weeklyReportEntry.entries.map((e) =>
        e.id === id ? { ...e, [key]: newValue } : e,
      )

      return {
        ...prev,
        weeklyReportEntry: {
          ...prev.weeklyReportEntry,
          entries: updatedEntries,
        },
      }
    })

    if (typeof newValue === 'string') {
      contentInput.change(newValue)
    } else {
      hoursInput.change(newValue.toString())
    }
  }

  return (
    <div className="grid grid-cols-11 grid-rows-1 items-center gap-4 mx-auto py-2">
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
            {(project) => (
              <ComboBox.Option id={project.id}>{project.name}</ComboBox.Option>
            )}
          </ComboBox.List>
        </ComboBox>
        <span id={field.project.errorId} className="text-sm text-red-500">
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
              projectId
                ? pipe(
                    missions,
                    filter((mission) => mission.projectId === projectId),
                  )
                : missions
            }
          >
            {(mission) => (
              <ComboBox.Option id={mission.id}>{mission.name}</ComboBox.Option>
            )}
          </ComboBox.List>
        </ComboBox>
        <span id={field.mission.errorId} className="text-sm text-red-500">
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
        <span id={field.hours.errorId} className="text-sm text-red-500">
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
        <span id={field.content.errorId} className="text-sm text-red-500">
          {field.content.errors}
        </span>
      </div>
      <div className="col-span-1">{removeButton}</div>
    </div>
  )
}
