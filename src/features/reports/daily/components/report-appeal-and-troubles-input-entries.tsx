'use client'

import { IconMinus, IconPlus } from '@intentui/icons'
import { useQueryStates } from 'nuqs'
import { useState } from 'react'
import type { Key } from 'react-aria-components'
import { Button } from '~/components/ui/intent-ui/button'
import { Checkbox } from '~/components/ui/intent-ui/checkbox'
import { ComboBox } from '~/components/ui/intent-ui/combo-box'
import { Textarea } from '~/components/ui/intent-ui/textarea'
import type {
  AppealCategoriesResponse,
  TroubleCategoriesResponse,
} from '~/features/reports/daily/types/api-response'
import { inputCountSearchParamsParsers } from '~/features/reports/daily/types/search-params/input-count-search-params-cache'

type ReportAppealAndTroublesInputEntriesProps<
  T extends
    | AppealCategoriesResponse['appealCategories']
    | TroubleCategoriesResponse['troubleCategories'],
> = {
  items: T
  kind: 'appeal' | 'trouble'
  unResolvedTroubles?: TroubleCategoriesResponse['unResolvedTroubles']
  existingAppeals?: AppealCategoriesResponse['existingAppeals']
}

export function ReportAppealAndTroubleInputEntries<
  T extends
    | AppealCategoriesResponse['appealCategories']
    | TroubleCategoriesResponse['troubleCategories'],
>({
  items,
  kind,
  unResolvedTroubles,
  existingAppeals,
}: ReportAppealAndTroublesInputEntriesProps<T>) {
  const [{ appealsAndTroublesEntry }, setAppealsAndTroublesState] = useQueryStates(
    inputCountSearchParamsParsers,
    {
      history: 'push',
      shallow: false,
    },
  )

  const [mutableUnresolvedTroubles, setMutableUnresolvedTroubles] = useState(
    unResolvedTroubles || [],
  )
  const [mutableExistingAppeals, setMutableExistingAppeals] = useState(existingAppeals || [])

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
              entries: [...prev.appealsAndTroublesEntry.appeals.entries, newEntry],
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
            entries: [...prev.appealsAndTroublesEntry.troubles.entries, newEntry],
          },
        },
      }
    })
  }

  const handleRemove = (id: string) => {
    if (kind === 'trouble') {
      if (mutableUnresolvedTroubles.some((t) => t.id === id)) {
        setMutableUnresolvedTroubles((prev) => prev.filter((t) => t.id !== id))

        return
      }
    } else if (kind === 'appeal') {
      if (mutableExistingAppeals.some((a) => a.id === id)) {
        setMutableExistingAppeals((prev) => prev.filter((a) => a.id !== id))

        return
      }
    }

    setAppealsAndTroublesState((prev) => {
      if (!prev) {
        return prev
      }

      if (kind === 'appeal') {
        const filteredEntries = prev.appealsAndTroublesEntry.appeals.entries.filter(
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

      const filteredEntries = prev.appealsAndTroublesEntry.troubles.entries.filter(
        (e) => e.id !== id,
      )

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
    if (kind === 'trouble') {
      if (mutableUnresolvedTroubles.some((t) => t.id === id)) {
        setMutableUnresolvedTroubles((prev) =>
          prev.map((t) => (t.id === id ? { ...t, trouble: newContent } : t)),
        )

        return
      }
    } else if (kind === 'appeal') {
      if (mutableExistingAppeals.some((a) => a.id === id)) {
        setMutableExistingAppeals((prev) =>
          prev.map((a) => (a.id === id ? { ...a, appeal: newContent } : a)),
        )

        return
      }
    }

    setAppealsAndTroublesState((prev) => {
      if (!prev) {
        return prev
      }

      if (kind === 'appeal') {
        const updatedEntries = prev.appealsAndTroublesEntry.appeals.entries.map((e) =>
          e.id === id ? { ...e, content: newContent } : e,
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

      const updatedEntries = prev.appealsAndTroublesEntry.troubles.entries.map((e) =>
        e.id === id ? { ...e, content: newContent } : e,
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
    if (kind === 'trouble') {
      if (mutableUnresolvedTroubles.some((t) => t.id === id)) {
        setMutableUnresolvedTroubles((prev) =>
          prev.map((t) => (t.id === id ? { ...t, categoryOfTroubleId: String(newItem) } : t)),
        )

        return
      }
    } else if (kind === 'appeal') {
      if (mutableExistingAppeals.some((a) => a.id === id)) {
        setMutableExistingAppeals((prev) =>
          prev.map((a) => (a.id === id ? { ...a, categoryOfAppealId: String(newItem) } : a)),
        )

        return
      }
    }

    setAppealsAndTroublesState((prev) => {
      if (!prev) {
        return prev
      }

      if (kind === 'appeal') {
        const updatedEntries = prev.appealsAndTroublesEntry.appeals.entries.map((e) =>
          e.id === id ? { ...e, item: newItem ? String(newItem) : null } : e,
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

      const updatedEntries = prev.appealsAndTroublesEntry.troubles.entries.map((e) =>
        e.id === id ? { ...e, item: newItem ? String(newItem) : null } : e,
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

  const handleChangeResolved = (id: string, resolved: boolean) => {
    setMutableUnresolvedTroubles((prev) => prev.map((t) => (t.id === id ? { ...t, resolved } : t)))
  }

  const renderEntry = (
    entry: { id: string; content: string; item: string | null; resolved?: boolean },
    index: number,
    isExisting: boolean,
    namePrefix: string,
  ) => {
    return (
      <div key={entry.id} className="mx-auto grid grid-cols-12 grid-rows-1 items-center gap-4 py-2">
        {/* Hidden inputs for form data structure */}
        <input type="hidden" name={`${namePrefix}[${index}].id`} value={entry.id} />
        <input type="hidden" name={`${namePrefix}[${index}].content`} value={entry.content || ''} />
        <input type="hidden" name={`${namePrefix}[${index}].categoryId`} value={entry.item || ''} />
        {kind === 'trouble' && (
          <input
            type="hidden"
            name={`${namePrefix}[${index}].resolved`}
            value={entry.resolved ? 'true' : 'false'}
          />
        )}

        <Textarea
          label="内容"
          placeholder="内容を入力"
          value={entry.content}
          onChange={(val) => handleChangeContent(entry.id, val)}
          className="col-span-3"
        />
        <ComboBox
          label={kind === 'appeal' ? 'アピールポイント' : 'トラブルカテゴリー'}
          placeholder="カテゴリーを選択"
          selectedKey={entry.item ?? undefined}
          onSelectionChange={(key) => handleChangeItem(entry.id, key)}
          className="col-span-2"
        >
          <ComboBox.Input />
          <ComboBox.List items={items}>
            {(item) => <ComboBox.Option id={item.id}>{item.name}</ComboBox.Option>}
          </ComboBox.List>
        </ComboBox>
        {kind === 'trouble' && isExisting ? (
          <Checkbox
            isSelected={entry.resolved ?? false}
            onChange={(checked) => handleChangeResolved(entry.id, checked)}
            className="col-span-1 mt-6"
          >
            解決済み
          </Checkbox>
        ) : (
          <Button
            size="square-petite"
            intent="danger"
            onPress={() => handleRemove(entry.id)}
            className="col-span-1 mt-6 rounded-full"
          >
            <IconMinus />
          </Button>
        )}
      </div>
    )
  }

  return (
    <>
      <Button size="square-petite" onPress={handleAdd} className="mt-4 rounded-full">
        <IconPlus />
      </Button>

      {kind === 'trouble' &&
        mutableUnresolvedTroubles.map((entry, index) =>
          renderEntry(
            {
              id: entry.id,
              content: entry.trouble,
              item: entry.categoryOfTroubleId,
              resolved: entry.resolved,
            },
            index,
            true,
            'troubleEntries',
          ),
        )}

      {kind === 'appeal' &&
        mutableExistingAppeals.map((entry, index) =>
          renderEntry(
            {
              id: entry.id,
              content: entry.content,
              item: entry.categoryId,
              resolved: undefined,
            },
            index,
            true,
            'appealEntries',
          ),
        )}

      {entries.map((entry, index) =>
        renderEntry(
          {
            id: entry.id,
            content: entry.content,
            item: entry.item,
            resolved: entry.resolved,
          },
          index +
            (kind === 'trouble' ? mutableUnresolvedTroubles.length : mutableExistingAppeals.length),
          false,
          kind === 'appeal' ? 'appealEntries' : 'troubleEntries',
        ),
      )}

      {entries.length >= 1 && (
        <Button size="square-petite" onPress={handleAdd} className="mt-4 rounded-full">
          <IconPlus />
        </Button>
      )}
    </>
  )
}
