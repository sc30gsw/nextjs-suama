import { type FieldName, useField, useInputControl } from '@conform-to/react'
import type { InferResponseType } from 'hono'
import { useState } from 'react'
import type { Key } from 'react-stately'
import { filter, find, pipe } from 'remeda'
import type {
  UpdateDailyReportEntrySchema,
  UpdateDailyReportFormSchema,
} from '~/features/reports/daily/types/schemas/edit-daily-report-form-schema'
import type { ReportEntry } from '~/features/reports/daily/types/search-params/input-count-search-params-cache'
import type { client } from '~/lib/rpc'

export function useEditDailyReportContentInputEntries(
  formId: string,
  name: FieldName<UpdateDailyReportEntrySchema, UpdateDailyReportFormSchema>,
  projects: InferResponseType<typeof client.api.projects.$get, 200>['projects'],
  missions: InferResponseType<typeof client.api.missions.$get, 200>['missions'],
) {
  const [meta] = useField(name, { formId })
  const field = meta.getFieldset()

  const projectInput = useInputControl(field.project)
  const missionInput = useInputControl(field.mission)
  const contentInput = useInputControl(field.content)
  const hoursInput = useInputControl(field.hours)

  // ? form resetがConformのものでは反映されないため
  const [projectId, setProjectId] = useState<Key | null>(projectInput.value ?? null)
  const [missionId, setMissionId] = useState<Key | null>(missionInput.value ?? null)

  const [projectFilter, setProjectFilter] = useState('')
  const [missionFilter, setMissionFilter] = useState('')

  const filteredProjects = projects.filter((project) => {
    const nameMatch = project.name.toLowerCase().includes(projectFilter.toLowerCase())
    const keywordMatch = project.likeKeywords?.toLowerCase().includes(projectFilter.toLowerCase())

    return nameMatch || keywordMatch
  })

  const filteredMissions = pipe(
    projectId
      ? pipe(
          missions,
          filter((mission) => mission.projectId === projectId),
        )
      : missions,
    filter((mission) => {
      const nameMatch = mission.name.toLowerCase().includes(missionFilter.toLowerCase())
      const keywordMatch = mission.likeKeywords?.toLowerCase().includes(missionFilter.toLowerCase())
      return nameMatch || keywordMatch
    }),
  )

  const handleChangeItem = (
    id: ReportEntry['id'],
    newItem: Key | null,
    kind: 'project' | 'mission',
  ) => {
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

  const handleChangeValue = (
    id: ReportEntry['id'],
    newValue: ReportEntry['content'] | ReportEntry['hours'],
  ) => {
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
    filteredProjects,
    filteredMissions,
    setProjectFilter,
    setMissionFilter,
  } as const
}
