import { type FieldName, useField, useInputControl } from '@conform-to/react'
import type { InferResponseType } from 'hono'
import { useState } from 'react'
import type { Key } from 'react-stately'
import { filter, find, pipe } from 'remeda'
import { useDailyReportSearchParams } from '~/features/reports/daily/hooks/use-daily-report-search-params'
import type {
  CreateDailyReportFormSchema,
  DailyReportEntrySchema,
} from '~/features/reports/daily/types/schemas/create-daily-report-form-schema'
import type {
  DailyInputCountSearchParams,
  ReportEntry,
} from '~/features/reports/daily/types/search-params/input-count-search-params-cache'
import { matchesJapaneseFilter } from '~/features/reports/utils/japanese-filter'
import type { client } from '~/lib/rpc'

const DEFAULT_MISSION_HOURS = 0.5

export function useCreateDailyReportContentInputEntries(
  initialDailyInputCountSearchParamsParsers: DailyInputCountSearchParams,
  formId: string,
  name: FieldName<DailyReportEntrySchema, CreateDailyReportFormSchema>,
  projects: InferResponseType<typeof client.api.projects.$get, 200>['projects'],
  missions: InferResponseType<typeof client.api.missions.$get, 200>['missions'],
) {
  const [meta] = useField(name, { formId })
  const field = meta.getFieldset()

  const projectInput = useInputControl(field.project)
  const missionInput = useInputControl(field.mission)
  const contentInput = useInputControl(field.content)
  const hoursInput = useInputControl(field.hours)

  const { setReportEntry } = useDailyReportSearchParams(initialDailyInputCountSearchParamsParsers)

  //? form resetがConformのものでは反映されないため
  const [projectId, setProjectId] = useState<Key | null>(projectInput.value ?? null)
  const [missionId, setMissionId] = useState<Key | null>(missionInput.value ?? null)

  const [projectFilter, setProjectFilter] = useState('')
  const [missionFilter, setMissionFilter] = useState('')
  const [isProjectFiltering, setIsProjectFiltering] = useState(false)
  const [isMissionFiltering, setIsMissionFiltering] = useState(false)

  const projectInputValue =
    isProjectFiltering || !projectId
      ? projectFilter
      : (projects.find((project) => project.id === projectId)?.name ?? '')

  const missionInputValue =
    isMissionFiltering || !missionId
      ? missionFilter
      : (missions.find((mission) => mission.id === missionId)?.name ?? '')

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

  const handleChangeItem = (
    id: ReportEntry['id'],
    newItem: Key | null,
    kind: 'project' | 'mission',
  ) => {
    if (!id) {
      return
    }

    if (!newItem) {
      if (kind === 'project') {
        setProjectId(null)
        projectInput.change(undefined)

        setProjectFilter('')
        setIsProjectFiltering(true)
      } else {
        setMissionId(null)
        missionInput.change(undefined)

        setMissionFilter('')
        setIsMissionFiltering(true)
      }
      return
    }

    setReportEntry((prev) => {
      if (!prev) {
        return prev
      }

      const updatedEntries = prev.reportEntry.entries.map((e) =>
        e.id === id ? { ...e, [kind]: newItem } : e,
      )

      return {
        ...prev,
        reportEntry: {
          ...prev.reportEntry,
          entries: updatedEntries,
        },
      }
    })

    if (kind === 'project') {
      setProjectId(newItem)
      projectInput.change(newItem.toString())
      setMissionId(null)
      missionInput.change(undefined)
      setProjectFilter('')
      setIsProjectFiltering(false)

      setReportEntry((prev) => {
        if (!prev) {
          return prev
        }

        const updatedEntries = prev.reportEntry.entries.map((e) =>
          e.id === id ? { ...e, project: newItem.toString(), mission: '' } : e,
        )

        return {
          ...prev,
          reportEntry: {
            ...prev.reportEntry,
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

      const selectedMission = missions.find((mission) => mission.id === newItem)
      setMissionFilter('')
      setIsMissionFiltering(false)
      const hasContentValue = (contentInput.value ?? '').trim().length > 0
      const hasHoursValue = Number(hoursInput.value ?? 0) > 0

      if (selectedMission && !hasContentValue) {
        handleChangeValue(id, selectedMission.name)
      }
      if (selectedMission && !hasHoursValue) {
        handleChangeValue(id, DEFAULT_MISSION_HOURS)
      }

      setReportEntry((prev) => {
        if (!prev) {
          return prev
        }

        const updatedEntries = prev.reportEntry.entries.map((e) => {
          if (e.id === id) {
            return {
              ...e,
              mission: newItem.toString(),
              project: findProject?.id ?? '',
              content:
                selectedMission && (e.content?.trim()?.length ?? 0) === 0
                  ? selectedMission.name
                  : e.content,
              hours:
                selectedMission && (e.hours <= 0) && !Number.isNaN(e.hours)
                  ? DEFAULT_MISSION_HOURS
                  : e.hours,
            }
          }
          return e
        })

        return {
          ...prev,
          reportEntry: {
            ...prev.reportEntry,
            entries: updatedEntries,
          },
        }
      })

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

    setReportEntry((prev) => {
      if (!prev) {
        return prev
      }

      const key = typeof newValue === 'string' ? 'content' : 'hours'
      const updatedEntries = prev.reportEntry.entries.map((e) =>
        e.id === id ? { ...e, [key]: newValue } : e,
      )

      return {
        ...prev,
        reportEntry: {
          ...prev.reportEntry,
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

  const handleProjectFilterChange = (value: string) => {
    setProjectFilter(value)
    setIsProjectFiltering(value !== '')
  }

  const handleMissionFilterChange = (value: string) => {
    setMissionFilter(value)
    setIsMissionFiltering(value !== '')
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
    projectFilter: projectInputValue,
    missionFilter: missionInputValue,
    setProjectFilter: handleProjectFilterChange,
    setMissionFilter: handleMissionFilterChange,
  } as const
}
