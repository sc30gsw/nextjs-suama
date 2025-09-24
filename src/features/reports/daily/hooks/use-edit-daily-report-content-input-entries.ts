import { type FieldName, useField, useInputControl } from '@conform-to/react'
import type { InferResponseType } from 'hono'
import { useState } from 'react'
import type { Key } from 'react-stately'
import { find, pipe } from 'remeda'
import type {
  UpdateDailyReportEntrySchema,
  UpdateDailyReportFormSchema,
} from '~/features/reports/daily/types/schemas/edit-daily-report-form-schema'
import type { client } from '~/lib/rpc'

export function useEditDailyReportContentInputEntries(
  formId: string,
  name: FieldName<UpdateDailyReportEntrySchema, UpdateDailyReportFormSchema>,
  projects: InferResponseType<typeof client.api.projects.$get, 200>['projects'],
) {
  const [meta] = useField(name, { formId })
  const field = meta.getFieldset()

  const projectInput = useInputControl(field.project)
  const missionInput = useInputControl(field.mission)
  const contentInput = useInputControl(field.content)
  const hoursInput = useInputControl(field.hours)

  // form resetがConformのものでは反映されないため
  const [projectId, setProjectId] = useState<Key | null>(projectInput.value ?? null)
  const [missionId, setMissionId] = useState<Key | null>(missionInput.value ?? null)

  const handleChangeItem = (id: string, newItem: Key | null, kind: 'project' | 'mission') => {
    if (!(id && newItem)) {
      return
    }

    if (kind === 'project') {
      setProjectId(newItem)
      projectInput.change(newItem.toString())
      setMissionId(null)
      missionInput.change(undefined)
    } else {
      setMissionId(newItem)
      missionInput.change(newItem.toString())

      const findProject = pipe(
        projects,
        find((project) => project.missions.some((mission) => mission.id === newItem)),
      )

      setProjectId(findProject?.id ?? null)
      projectInput.change(findProject?.id.toString() ?? '')
    }
  }

  const handleChangeValue = (id: string, newValue: string | number) => {
    if (!id) {
      return
    }

    if (typeof newValue === 'string') {
      contentInput.change(newValue)
    } else {
      hoursInput.change(newValue.toString())
    }
  }

  return {
    field,
    missionInput,
    contentInput,
    hoursInput,
    projectId,
    missionId,
    handleChangeItem,
    handleChangeValue,
  } as const
}
