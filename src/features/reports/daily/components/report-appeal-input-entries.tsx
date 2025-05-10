'use client'

import { IconMinus, IconPlus } from '@intentui/icons'
import type { InferResponseType } from 'hono'
import { useQueryStates } from 'nuqs'
import { useState } from 'react'
import type { Key } from 'react-aria-components'
import { Button } from '~/components/ui/intent-ui/button'
import { ComboBox } from '~/components/ui/intent-ui/combo-box'
import { Textarea } from '~/components/ui/intent-ui/textarea'
import { inputCountSearchParamsParsers } from '~/features/reports/daily/types/search-params/input-count-search-params-cache'
import type { client } from '~/lib/rpc'

type ReportTroublesInputEntriesProps = {
  appeals: InferResponseType<typeof client.api.projects.$get, 200>['todos']
}

export function ReportAppealInputEntries({
  appeals,
}: ReportTroublesInputEntriesProps) {
  const [{ appealCount }, setCount] = useQueryStates(
    inputCountSearchParamsParsers,
    {
      history: 'push',
      shallow: false,
    },
  )

  const [entries, setEntries] = useState<
    {
      id: string
      content: string
      appeal: Key | null
      resolved: boolean
    }[]
  >(() =>
    Array.from({ length: appealCount > 0 ? appealCount : 0 }, () => ({
      id: crypto.randomUUID(),
      content: '',
      appeal: null,
      resolved: false,
    })),
  )

  return (
    <>
      <Button
        size="square-petite"
        onPress={() => {
          setCount((prev) => {
            const newCount = prev.appealCount > 0 ? prev.appealCount + 1 : 1

            setEntries((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                content: '',
                appeal: null,
                resolved: false,
              },
            ])

            return { appealCount: newCount }
          })
        }}
        className="rounded-full mt-4"
      >
        <IconPlus />
      </Button>
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="grid grid-cols-12 grid-rows-1 items-center gap-4 mx-auto py-2"
        >
          <Textarea
            label="内容"
            placeholder="内容を入力"
            value={entry.content}
            onChange={(val) =>
              setEntries((prev) =>
                prev.map((e) =>
                  e.id === entry.id ? { ...e, content: val } : e,
                ),
              )
            }
            className="col-span-3"
          />
          <ComboBox
            label="工夫したこと"
            placeholder="カテゴリーを選択"
            onSelectionChange={(key) => {
              setEntries((prev) =>
                prev.map((e) =>
                  e.id === entry.id ? { ...e, appeal: key } : e,
                ),
              )
            }}
            selectedKey={entry.appeal}
            className="col-span-2"
          >
            <ComboBox.Input />
            <ComboBox.List items={appeals}>
              {(appeal) => (
                <ComboBox.Option id={appeal.id}>{appeal.todo}</ComboBox.Option>
              )}
            </ComboBox.List>
          </ComboBox>
          <Button
            size="square-petite"
            intent="danger"
            onPress={() => {
              setEntries((prev) => {
                const updated = prev.filter((e) => e.id !== entry.id)

                return updated
              })

              setCount((prev) => {
                const newCount = prev.appealCount > 1 ? prev.appealCount - 1 : 0
                return { appealCount: newCount }
              })
            }}
            className="rounded-full mt-6 col-span-1"
          >
            <IconMinus />
          </Button>
        </div>
      ))}
    </>
  )
}
