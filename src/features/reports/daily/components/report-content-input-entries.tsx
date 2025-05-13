'use client'

import { IconMinus, IconPlus } from '@intentui/icons'
import type { InferResponseType } from 'hono'
import { useQueryStates } from 'nuqs'
import type { Key } from 'react-aria-components'
import { Button } from '~/components/ui/intent-ui/button'
import { Checkbox } from '~/components/ui/intent-ui/checkbox'
import { ComboBox } from '~/components/ui/intent-ui/combo-box'
import { Heading } from '~/components/ui/intent-ui/heading'
import { NumberField } from '~/components/ui/intent-ui/number-field'
import { Separator } from '~/components/ui/intent-ui/separator'
import { TextField } from '~/components/ui/intent-ui/text-field'
import { inputCountSearchParamsParsers } from '~/features/reports/daily/types/search-params/input-count-search-params-cache'
import type { client } from '~/lib/rpc'

type ReportContentInputEntriesProps = {
  projects: InferResponseType<typeof client.api.projects.$get, 200>['todos']
  missions: InferResponseType<typeof client.api.missions.$get, 200>['posts']
}

export function ReportContentInputEntries({
  projects,
  missions,
}: ReportContentInputEntriesProps) {
  const [{ reportEntry }, setReportState] = useQueryStates(
    inputCountSearchParamsParsers,
    {
      history: 'push',
      shallow: false,
    },
  )

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

  const handleRemove = (id: string) => {
    setReportState((prev) => {
      if (!prev) {
        return prev
      }

      const filteredEntries = prev.reportEntry.entries.filter(
        (e) => e.id !== id,
      )

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
    id: string,
    newItem: Key | null,
    kind: 'project' | 'mission',
  ) => {
    setReportState((prev) => {
      if (!prev) {
        return prev
      }

      const updatedEntries = prev.reportEntry.entries.map((e) =>
        e.id === id ? { ...e, [kind]: Number(newItem) } : e,
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

  const handleChangeValue = (id: string, newValue: string | number) => {
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
      <Button
        size="square-petite"
        onPress={handleAdd}
        className="rounded-full mt-4"
      >
        <IconPlus />
      </Button>
      {reportEntry.entries.map((entry) => {
        // TODO: ミッションが選択されている場合、プロジェクトをfilter（findだとComboBox.Listのitemsの型エラーとなる）
        // const filteredProject = entry.mission ? projects.filter((project) => project.missionId === entry.mission) : projects
        // TODO: プロジェクトが選択されていない場合は、ミッションをfilter
        // const filteredMissions = entry.project ? missions.filter((mission) => mission.projectId === entry.project) : missions

        return (
          <div
            key={entry.id}
            className="grid grid-cols-11 grid-rows-1 items-center gap-4 mx-auto py-2"
          >
            <ComboBox
              label="プロジェクト"
              placeholder="プロジェクトを選択"
              onSelectionChange={(key) => {
                handleChangeItem(entry.id, key, 'project')
              }}
              selectedKey={entry.project}
              className="col-span-2"
            >
              <ComboBox.Input />
              <ComboBox.List items={projects}>
                {(project) => (
                  <ComboBox.Option id={project.id}>
                    {project.todo}
                  </ComboBox.Option>
                )}
              </ComboBox.List>
            </ComboBox>
            <ComboBox
              label="ミッション"
              placeholder="ミッションを選択"
              onSelectionChange={(key) => {
                handleChangeItem(entry.id, key, 'mission')
              }}
              selectedKey={entry.mission}
              className="col-span-2"
            >
              <ComboBox.Input />
              <ComboBox.List items={missions}>
                {(mission) => (
                  <ComboBox.Option id={mission.id}>
                    {mission.title}
                  </ComboBox.Option>
                )}
              </ComboBox.List>
            </ComboBox>
            <NumberField
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
            <Button
              size="square-petite"
              intent="danger"
              onPress={() => handleRemove(entry.id)}
              className="rounded-full mt-6 col-span-1"
            >
              <IconMinus />
            </Button>
          </div>
        )
      })}

      <Separator orientation="horizontal" />
      {/* ? https://qiita.com/curry__30/items/24e7c144123a9fc15fa3#ui%E4%BD%9C%E6%88%90 */}
      <div className="my-4">
        <Checkbox className="cursor-pointer">リモート勤務</Checkbox>
      </div>
      <Separator orientation="horizontal" />
      <div className="flex items-center gap-x-2 my-4">
        <span className="text-sm">合計時間:</span>
        <Heading className="text-muted-fg text-lg">{totalHours}時間</Heading>
      </div>
    </>
  )
}
