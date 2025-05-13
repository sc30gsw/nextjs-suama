'use client'

import { IconMinus, IconPlus } from '@intentui/icons'
import { useQueryStates } from 'nuqs'
import type { Key } from 'react-aria-components'
import { Button } from '~/components/ui/intent-ui/button'
import { ComboBox } from '~/components/ui/intent-ui/combo-box'
import { Textarea } from '~/components/ui/intent-ui/textarea'
import type {
  AppealResponse,
  TroubleResponse,
} from '~/features/reports/daily/types/api-response'
import { inputCountSearchParamsParsers } from '~/features/reports/daily/types/search-params/input-count-search-params-cache'

type ReportAppealAndTroublesInputEntriesProps<
  T extends AppealResponse['appeals'] | TroubleResponse['troubles'],
> = {
  items: T
  kind: 'appeal' | 'trouble'
}

export function ReportAppealAndTroubleInputEntries<
  T extends AppealResponse['appeals'] | TroubleResponse['troubles'],
>({ items, kind }: ReportAppealAndTroublesInputEntriesProps<T>) {
  const [{ appealsAndTroublesEntry }, setAppealsAndTroublesState] =
    useQueryStates(inputCountSearchParamsParsers, {
      history: 'push',
      shallow: false,
    })

  const entries =
    kind === 'appeal'
      ? appealsAndTroublesEntry.appeals.entries
      : appealsAndTroublesEntry.troubles.entries

  const handleAdd = () => {
    const newEntry = {
      id: crypto.randomUUID(),
      content: '',
      item: null,
      resolved: kind === 'appeal' ? undefined : false,
    } as const satisfies (typeof appealsAndTroublesEntry.appeals.entries)[number]

    setAppealsAndTroublesState((prev) => {
      if (!prev) {
        return prev
      }

      if (kind === 'appeal') {
        return {
          ...prev,
          appealsAndTroublesEntry: {
            ...prev.appealsAndTroublesEntry,
            appeals: {
              count: prev.appealsAndTroublesEntry.appeals.count + 1,
              entries: [
                ...prev.appealsAndTroublesEntry.appeals.entries,
                newEntry,
              ],
            },
          },
        }
      }

      return {
        ...prev,
        appealsAndTroublesEntry: {
          ...prev.appealsAndTroublesEntry,
          troubles: {
            count: prev.appealsAndTroublesEntry.troubles.count + 1,
            entries: [
              ...prev.appealsAndTroublesEntry.troubles.entries,
              newEntry,
            ],
          },
        },
      }
    })
  }

  const handleRemove = (id: string) => {
    setAppealsAndTroublesState((prev) => {
      if (!prev) {
        return prev
      }

      if (kind === 'appeal') {
        const filteredEntries =
          prev.appealsAndTroublesEntry.appeals.entries.filter(
            (e) => e.id !== id,
          )

        return {
          ...prev,
          appealsAndTroublesEntry: {
            ...prev.appealsAndTroublesEntry,
            appeals: {
              count: filteredEntries.length,
              entries: filteredEntries,
            },
          },
        }
      }

      const filteredEntries =
        prev.appealsAndTroublesEntry.troubles.entries.filter((e) => e.id !== id)

      return {
        ...prev,
        appealsAndTroublesEntry: {
          ...prev.appealsAndTroublesEntry,
          troubles: {
            count: filteredEntries.length,
            entries: filteredEntries,
          },
        },
      }
    })
  }

  const handleChangeContent = (id: string, newContent: string) => {
    setAppealsAndTroublesState((prev) => {
      if (!prev) {
        return prev
      }

      if (kind === 'appeal') {
        const updatedEntries = prev.appealsAndTroublesEntry.appeals.entries.map(
          (e) => (e.id === id ? { ...e, content: newContent } : e),
        )

        return {
          ...prev,
          appealsAndTroublesEntry: {
            ...prev.appealsAndTroublesEntry,
            appeals: {
              count: updatedEntries.length,
              entries: updatedEntries,
            },
          },
        }
      }

      const updatedEntries = prev.appealsAndTroublesEntry.troubles.entries.map(
        (e) => (e.id === id ? { ...e, content: newContent } : e),
      )

      return {
        ...prev,
        appealsAndTroublesEntry: {
          ...prev.appealsAndTroublesEntry,
          troubles: {
            count: updatedEntries.length,
            entries: updatedEntries,
          },
        },
      }
    })
  }

  const handleChangeItem = (id: string, newItem: Key | null) => {
    setAppealsAndTroublesState((prev) => {
      if (!(prev && newItem)) {
        return prev
      }

      if (kind === 'appeal') {
        const updatedEntries = prev.appealsAndTroublesEntry.appeals.entries.map(
          (e) => (e.id === id ? { ...e, item: Number(newItem) } : e),
        )

        return {
          ...prev,
          appealsAndTroublesEntry: {
            ...prev.appealsAndTroublesEntry,
            appeals: {
              count: updatedEntries.length,
              entries: updatedEntries,
            },
          },
        }
      }

      const updatedEntries = prev.appealsAndTroublesEntry.troubles.entries.map(
        (e) => (e.id === id ? { ...e, item: Number(newItem) } : e),
      )

      return {
        ...prev,
        appealsAndTroublesEntry: {
          ...prev.appealsAndTroublesEntry,
          troubles: {
            count: updatedEntries.length,
            entries: updatedEntries,
          },
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
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="grid grid-cols-12 grid-rows-1 items-center gap-4 mx-auto py-2"
        >
          <Textarea
            label="内容"
            placeholder="内容を入力"
            value={entry.content}
            onChange={(val) => handleChangeContent(entry.id, val)}
            className="col-span-3"
          />
          <ComboBox
            label="工夫したこと"
            placeholder="カテゴリーを選択"
            selectedKey={entry.item}
            onSelectionChange={(key) => handleChangeItem(entry.id, key)}
            className="col-span-2"
          >
            <ComboBox.Input />
            <ComboBox.List items={items}>
              {(item) => (
                <ComboBox.Option id={item.id}>{item.todo}</ComboBox.Option>
              )}
            </ComboBox.List>
          </ComboBox>
          <Button
            size="square-petite"
            intent="danger"
            onPress={() => handleRemove(entry.id)}
            className="rounded-full mt-6 col-span-1"
          >
            <IconMinus />
          </Button>
        </div>
      ))}
    </>
  )
}
