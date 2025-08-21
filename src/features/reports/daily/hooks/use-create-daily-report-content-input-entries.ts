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
import type { DailyInputCountSearchParams } from '~/features/reports/daily/types/search-params/input-count-search-params-cache'
import type { client } from '~/lib/rpc'

export function useCreateDailyReportContentInputEntries(
  initialDailyInputCountSearchParamsParsers: DailyInputCountSearchParams,
  formId: string,
  name: FieldName<DailyReportEntrySchema, CreateDailyReportFormSchema>,
  projects: InferResponseType<typeof client.api.projects.$get, 200>['projects'],
) {
  const [meta] = useField(name, { formId })
  const field = meta.getFieldset()

  const projectInput = useInputControl(field.project)
  const missionInput = useInputControl(field.mission)
  const contentInput = useInputControl(field.content)
  const hoursInput = useInputControl(field.hours)

  const { setReportEntry } = useDailyReportSearchParams(initialDailyInputCountSearchParamsParsers)

  // form resetがConformのものでは反映されないため
  const [projectId, setProjectId] = useState<Key | null>(projectInput.value ?? null)
  const [missionId, setMissionId] = useState<Key | null>(missionInput.value ?? null)

  const handleChangeItem = (id: string, newItem: Key | null, kind: 'project' | 'mission') => {
    if (!(id && newItem)) {
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

  const handleChangeValue = (id: string, newValue: string | number) => {
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
