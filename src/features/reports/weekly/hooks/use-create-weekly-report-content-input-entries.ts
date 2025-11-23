import { type FieldName, useField, useInputControl } from '@conform-to/react'
import type { InferResponseType } from 'hono'
import { useState } from 'react'
import type { Key } from 'react-stately'
import { filter, find, pipe } from 'remeda'
import { useWeeklyReportSearchParams } from '~/features/reports/weekly/hooks/use-weekly-report-search-params'
import type {
  CreateWeeklyReportFormSchema,
  CreateWeeklyReportSchema,
} from '~/features/reports/weekly/types/schemas/create-weekly-report-form-schema'

import type {
  WeeklyInputCountSearchParams,
  WeeklyReportEntry,
} from '~/features/reports/weekly/types/search-params/weekly-input-count-search-params-cache'
import type { client } from '~/lib/rpc'

export function useCreateWeeklyReportContentInputEntries(
  initialWeeklyInputCountSearchParamsParsers: WeeklyInputCountSearchParams,
  formId: string,
  name: FieldName<CreateWeeklyReportSchema, CreateWeeklyReportFormSchema>,
  projects: InferResponseType<typeof client.api.projects.$get, 200>['projects'],
  missions: InferResponseType<typeof client.api.missions.$get, 200>['missions'],
) {
  const [meta] = useField(name, { formId })
  const field = meta.getFieldset()

  const projectInput = useInputControl(field.project)
  const missionInput = useInputControl(field.mission)
  const contentInput = useInputControl(field.content)
  const hoursInput = useInputControl(field.hours)

  const { setWeeklyReportEntry } = useWeeklyReportSearchParams(
    initialWeeklyInputCountSearchParamsParsers,
  )

  //? form resetがConformのものでは反映されないため
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
    id: WeeklyReportEntry['id'],
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
      setMissionId(newItem)
      missionInput.change(newItem.toString())

      const findProject = pipe(
        projects,
        find((project) => project.missions.some((mission) => mission.id === newItem)),
      )

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
