import { type FieldName, useField, useInputControl } from '@conform-to/react'
import type { InferResponseType } from 'hono'
import { useState } from 'react'
import type { Key } from 'react-stately'
import { filter, find, pipe } from 'remeda'
import { useWeeklyReportSearchParams } from '~/features/reports/weekly/hooks/use-weekly-report-search-params'
import type {
  UpdateWeeklyReportFormSchema,
  UpdateWeeklyReportSchema,
} from '~/features/reports/weekly/types/schemas/update-weekly-report-form-schema'
import type {
  UpdateWeeklyInputCountSearchParams,
  WeeklyReportEntry,
} from '~/features/reports/weekly/types/search-params/weekly-input-count-search-params-cache'
import type { client } from '~/lib/rpc'
import { matchesJapaneseFilter } from '~/features/reports/utils/japanese-filter'

export function useUpdatedWeeklyReportContentInputEntries(
  initialWeeklyInputCountSearchParamsParsers: UpdateWeeklyInputCountSearchParams,
  formId: string,
  name: FieldName<UpdateWeeklyReportSchema, UpdateWeeklyReportFormSchema>,
  projects: InferResponseType<typeof client.api.projects.$get, 200>['projects'],
  missions: InferResponseType<typeof client.api.missions.$get, 200>['missions'],
) {
  const [meta] = useField(name, { formId })
  const field = meta.getFieldset()

  const projectInput = useInputControl(field.project)
  const missionInput = useInputControl(field.mission)
  const contentInput = useInputControl(field.content)
  const hoursInput = useInputControl(field.hours)

  //? form resetがConformのものでは反映されないため
  const [projectId, setProjectId] = useState<Key | null>(projectInput.value ?? null)
  const [missionId, setMissionId] = useState<Key | null>(missionInput.value ?? null)

  const [projectFilter, setProjectFilter] = useState('')
  const [missionFilter, setMissionFilter] = useState('')

  const filteredProjects = projects.filter((project) => {
    const nameMatch = matchesJapaneseFilter(project.name, projectFilter)
    const keywordMatch = project.likeKeywords
      ? matchesJapaneseFilter(project.likeKeywords, projectFilter)
      : false

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
      const nameMatch = matchesJapaneseFilter(mission.name, missionFilter)
      const keywordMatch = mission.likeKeywords
        ? matchesJapaneseFilter(mission.likeKeywords, missionFilter)
        : false

      return nameMatch || keywordMatch
    }),
  )

  const { setWeeklyReportEntry } = useWeeklyReportSearchParams(
    initialWeeklyInputCountSearchParamsParsers,
  )

  const handleChangeItem = (
    id: WeeklyReportEntry['id'],
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

      setWeeklyReportEntry((prev) => {
        if (!prev) {
          return prev
        }

        const updatedEntries = prev.weeklyReportEntry.entries.map((e) =>
          e.id === id ? { ...e, project: newItem.toString(), mission: '' } : e,
        )

        return {
          ...prev,
          weeklyReportEntry: {
            ...prev.weeklyReportEntry,
            entries: updatedEntries,
          },
        }
      })
    } else {
      missionId
        ? pipe(
            projects,
            filter((project) => project.missions.some((mission) => mission.id === missionId)),
          )
        : projects
      setMissionId(newItem)
      missionInput.change(newItem.toString())

      const findProject = pipe(
        projects,
        find((project) => project.missions.some((mission) => mission.id === newItem)),
      )

      const selectedMission = missions.find((mission) => mission.id === newItem)
      if (selectedMission) {
        handleChangeValue(id, selectedMission.name)
        handleChangeValue(id, 0.5)
      }

      setWeeklyReportEntry((prev) => {
        if (!prev) {
          return prev
        }

        const updatedEntries = prev.weeklyReportEntry.entries.map((e) => {
          if (e.id === id) {
            return {
              ...e,
              mission: newItem.toString(),
              project: findProject?.id ?? '',
              content: selectedMission?.name ?? e.content,
              hours: selectedMission ? 0.5 : e.hours,
            }
          }
          return e
        })

        return {
          ...prev,
          weeklyReportEntry: {
            ...prev.weeklyReportEntry,
            entries: updatedEntries,
          },
        }
      })

      setProjectId(findProject?.id ?? null)
      projectInput.change(findProject?.id.toString() ?? '')
    }
  }

  const handleChangeValue = (
    id: WeeklyReportEntry['id'],
    newValue: WeeklyReportEntry['content'] | WeeklyReportEntry['hours'],
  ) => {
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

  return {
    field,
    hoursInput,
    contentInput,
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
