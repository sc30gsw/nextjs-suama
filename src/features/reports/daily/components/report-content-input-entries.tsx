'use client'
import { IconMinus, IconPlus } from '@intentui/icons'
import { useQueryStates } from 'nuqs'
import type { Key } from 'react-aria-components'
import { filter, pipe } from 'remeda'
import { buttonStyles } from '~/components/ui/intent-ui/button'
import { ComboBox } from '~/components/ui/intent-ui/combo-box'
import { NumberField } from '~/components/ui/intent-ui/number-field'
import { Separator } from '~/components/ui/intent-ui/separator'
import { TextField } from '~/components/ui/intent-ui/text-field'
import { Tooltip } from '~/components/ui/intent-ui/tooltip'
import { TotalHours } from '~/features/reports/components/total-hours'
import {
  inputCountSearchParamsParsers,
  type ReportEntry,
} from '~/features/reports/daily/types/search-params/input-count-search-params-cache'
import { ProjectModel } from '~/features/report-contexts/projects/api/model'
import { MissionModel } from '~/features/report-contexts/missions/api/model'
import { cn } from '~/utils/classes'

type ReportContentInputEntriesProps = {
  projects: ProjectModel.getProjectsResponse['projects']
  missions: MissionModel.getMissionsResponse['missions']
}

export function ReportContentInputEntries({ projects, missions }: ReportContentInputEntriesProps) {
  const [{ reportEntry }, setReportState] = useQueryStates(inputCountSearchParamsParsers, {
    history: 'push',
    shallow: false,
  })

  const totalHours = reportEntry.entries.reduce((acc, entry) => {
    if (entry.hours > 0) {
      return acc + entry.hours
    }
    return acc
  }, 0)

  const handleAdd = () => {
    const newEntry = {
      id: crypto.randomUUID(),
      project: null,
      mission: null,
      hours: 0,
      content: '',
    } as const satisfies (typeof reportEntry.entries)[number]

    setReportState((prev) => {
      if (!prev) {
        return prev
      }

      return {
        ...prev,
        reportEntry: {
          ...prev.reportEntry,
          count: prev.reportEntry.count + 1,
          entries: [...prev.reportEntry.entries, newEntry],
        },
      }
    })
  }

  const handleRemove = (id: ReportEntry['id']) => {
    setReportState((prev) => {
      if (!prev) {
        return prev
      }

      const filteredEntries = prev.reportEntry.entries.filter((e) => e.id !== id)

      return {
        ...prev,
        reportEntry: {
          ...prev.reportEntry,
          count: prev.reportEntry.count > 1 ? prev.reportEntry.count - 1 : 1,
          entries: filteredEntries,
        },
      }
    })
  }

  const handleChangeItem = (
    id: ReportEntry['id'],
    newItem: Key | null,
    kind: 'project' | 'mission',
  ) => {
    setReportState((prev) => {
      if (!prev) {
        return prev
      }

      const updatedEntries = prev.reportEntry.entries.map((e) =>
        e.id === id ? { ...e, [kind]: newItem ? String(newItem) : null } : e,
      )

      return {
        ...prev,
        reportEntry: {
          ...prev.reportEntry,
          entries: updatedEntries,
        },
      }
    })
  }

  const handleChangeValue = (
    id: ReportEntry['id'],
    newValue: ReportEntry['content'] | ReportEntry['hours'],
  ) => {
    setReportState((prev) => {
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
  }

  return (
    <>
      <Tooltip delay={0}>
        <Tooltip.Trigger
          className={cn(buttonStyles({ size: 'sq-sm', isCircle: true }), 'mt-4')}
          onPress={handleAdd}
        >
          <IconPlus />
        </Tooltip.Trigger>
        <Tooltip.Content>職務内容を追加</Tooltip.Content>
      </Tooltip>
      {reportEntry.entries.map((entry, index) => {
        const filteredProjects = entry.mission
          ? pipe(
              projects,
              filter((project) => project.missions.some((mission) => mission.id === entry.mission)),
            )
          : projects

        const filteredMissions = entry.project
          ? pipe(
              missions,
              filter((mission) => mission.projectId === entry.project),
            )
          : missions

        return (
          <div
            key={entry.id}
            className="mx-auto grid grid-cols-11 grid-rows-1 items-center gap-4 py-2"
          >
            {/* Hidden inputs for ID and form data structure */}
            <input type="hidden" name={`reportEntries[${index}][id]`} value={entry.id} />
            <input
              type="hidden"
              name={`reportEntries[${index}][project]`}
              value={entry.project || ''}
            />
            <input
              type="hidden"
              name={`reportEntries[${index}][mission]`}
              value={entry.mission || ''}
            />
            <input
              type="hidden"
              name={`reportEntries[${index}][hours]`}
              value={entry.hours.toString()}
            />
            <input
              type="hidden"
              name={`reportEntries[${index}][content]`}
              value={entry.content || ''}
            />

            <ComboBox
              label="プロジェクト"
              placeholder="プロジェクトを選択"
              onSelectionChange={(key) => {
                handleChangeItem(entry.id, key, 'project')
              }}
              selectedKey={entry.project ?? undefined}
              className="col-span-2"
            >
              <ComboBox.Input />
              <ComboBox.List items={filteredProjects}>
                {(project) => <ComboBox.Option id={project.id}>{project.name}</ComboBox.Option>}
              </ComboBox.List>
            </ComboBox>
            <ComboBox
              label="ミッション"
              placeholder="ミッションを選択"
              onSelectionChange={(key) => {
                handleChangeItem(entry.id, key, 'mission')
              }}
              selectedKey={entry.mission ?? undefined}
              className="col-span-2"
            >
              <ComboBox.Input />
              <ComboBox.List items={filteredMissions}>
                {(mission) => <ComboBox.Option id={mission.id}>{mission.name}</ComboBox.Option>}
              </ComboBox.List>
            </ComboBox>
            <NumberField
              step={0.05}
              label="時間"
              value={entry.hours}
              onChange={(val) => handleChangeValue(entry.id, val)}
              className="col-span-2"
            />
            <TextField
              label="内容"
              placeholder="タスク内容を入力"
              value={entry.content}
              onChange={(val) => handleChangeValue(entry.id, val)}
              className="col-span-4"
            />
            <Tooltip delay={0}>
              <Tooltip.Trigger
                className={cn(
                  buttonStyles({ size: 'sq-xs', intent: 'danger', isCircle: true }),
                  'mt-6',
                )}
                onPress={() => handleRemove(entry.id)}
              >
                <IconMinus />
              </Tooltip.Trigger>
              <Tooltip.Content>職務内容を削除</Tooltip.Content>
            </Tooltip>
          </div>
        )
      })}

      <Separator orientation="horizontal" />
      <TotalHours totalHours={totalHours} />
    </>
  )
}
