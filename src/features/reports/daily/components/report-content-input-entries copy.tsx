'use client'

import { IconMinus, IconPlus } from '@intentui/icons'
import type { InferResponseType } from 'hono'
import { useQueryStates } from 'nuqs'
import { useState } from 'react'
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
  const [{ count }, setCount] = useQueryStates(inputCountSearchParamsParsers, {
    history: 'push',
    shallow: false,
  })

  const [entries, setEntries] = useState<
    {
      id: string
      project: Key | null
      mission: Key | null
      hours: number
      content: string
    }[]
  >(() =>
    Array.from({ length: count > 0 ? count : 1 }, () => ({
      id: crypto.randomUUID(),
      project: null,
      mission: null,
      hours: 0,
      content: '',
    })),
  )

  const totalHours = entries.reduce((acc, entry) => {
    if (entry.hours > 0) {
      return acc + entry.hours
    }
    return acc
  }, 0)

  return (
    <>
      <Button
        size="square-petite"
        onPress={() => {
          setCount((prev) => {
            const newCount = prev.count > 0 ? prev.count + 1 : 1

            setEntries((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                project: null,
                mission: null,
                hours: 0,
                content: '',
              },
            ])

            return { count: newCount }
          })
        }}
        className="rounded-full mt-4"
      >
        <IconPlus />
      </Button>
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="grid grid-cols-11 grid-rows-1 items-center gap-4 mx-auto py-2"
        >
          <ComboBox
            label="プロジェクト"
            placeholder="プロジェクトを選択"
            onSelectionChange={(key) => {
              setEntries((prev) =>
                prev.map((e) =>
                  e.id === entry.id ? { ...e, project: key } : e,
                ),
              )
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
              setEntries((prev) =>
                prev.map((e) =>
                  e.id === entry.id ? { ...e, mission: key } : e,
                ),
              )
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
            onChange={(val) =>
              setEntries((prev) =>
                prev.map((e) => (e.id === entry.id ? { ...e, hours: val } : e)),
              )
            }
            className="col-span-2"
          />
          <TextField
            label="内容"
            placeholder="タスク内容を入力"
            value={entry.content}
            onChange={(val) =>
              setEntries((prev) =>
                prev.map((e) =>
                  e.id === entry.id ? { ...e, content: val } : e,
                ),
              )
            }
            className="col-span-4"
          />
          <Button
            size="square-petite"
            intent="danger"
            onPress={() => {
              setEntries((prev) => {
                const updated = prev.filter((e) => e.id !== entry.id)

                if (updated.length > 0) {
                  return updated
                }

                return [entry]
              })

              setCount((prev) => {
                const newCount = prev.count > 1 ? prev.count - 1 : 1
                return { count: newCount }
              })
            }}
            className="rounded-full mt-6 col-span-1"
          >
            <IconMinus />
          </Button>
        </div>
      ))}

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
