'use client'

import { IconMinus, IconPlus } from '@intentui/icons'
import { useQueryStates } from 'nuqs'
import { useEffect } from 'react'
import type { Key } from 'react-aria-components'
import { Button } from '~/components/ui/intent-ui/button'
import { Checkbox } from '~/components/ui/intent-ui/checkbox'
import { ComboBox } from '~/components/ui/intent-ui/combo-box'
import { Textarea } from '~/components/ui/intent-ui/textarea'
import type {
  AppealCategoriesResponse,
  TroubleCategoriesResponse,
  unResolvedTroublesResponse,
} from '~/features/reports/daily/types/api-response'
import { inputCountSearchParamsParsers } from '~/features/reports/daily/types/search-params/input-count-search-params-cache'

type ReportAppealAndTroublesInputEntriesProps<
  T extends
    | AppealCategoriesResponse['appealCategories']
    | TroubleCategoriesResponse['troubleCategories'],
> = {
  items: T
  kind: 'appeal' | 'trouble'
  unResolvedTroubles?: unResolvedTroublesResponse
}

export function ReportAppealAndTroubleInputEntries<
  T extends
    | AppealCategoriesResponse['appealCategories']
    | TroubleCategoriesResponse['troubleCategories'],
>({ items, kind, unResolvedTroubles }: ReportAppealAndTroublesInputEntriesProps<T>) {
  const [{ appealsAndTroublesEntry }, setAppealsAndTroublesState] = useQueryStates(
    inputCountSearchParamsParsers,
    {
      history: 'push',
      shallow: false,
    },
  )

  // TODO: useEffectを使わずに実装する方法を検討。初期値がある場合、entriesの頭に既存データを差し込む方法を試してみる。or
  // TODO: 一別の配列として分けてmapで回す。リロード時も検証。サーバー側の処理の視点も考慮。こっちが優勢？
  // ?:nuqsとの同期を取るために仕方なくuseEffectを使用
  // 1. このコンポーネントの状態は`nuqs`によってURLで管理されています。
  // 2. トラブルの初期データはunResolvedTroublesとして、propsとして渡されます。
  // 3. nuqsがURLを見た時は空なので、初期データをセットしてあげないとunResolvedTroublesの値が無視されることになる。
  useEffect(() => {
    if (kind === 'trouble' && unResolvedTroubles && unResolvedTroubles.length > 0) {
      const hasEntries = appealsAndTroublesEntry.troubles.entries.length > 0

      if (!hasEntries) {
        const initialEntries = unResolvedTroubles.map((trouble) => ({
          id: trouble.id,
          content: trouble.trouble,
          item: trouble.categoryOfTroubleId,
          resolved: false,
        }))

        setAppealsAndTroublesState({
          appealsAndTroublesEntry: {
            ...appealsAndTroublesEntry,
            troubles: {
              count: initialEntries.length,
              entries: initialEntries,
            },
          },
        })
      }
    }
  }, [kind, unResolvedTroubles, appealsAndTroublesEntry, setAppealsAndTroublesState])

  const entries =
    kind === 'appeal'
      ? appealsAndTroublesEntry.appeals.entries
      : appealsAndTroublesEntry.troubles.entries

  // 既存のtroubleかどうかを判定する関数
  const isExistingTrouble = (entryId: string) => {
    if (kind === 'trouble' && unResolvedTroubles) {
      return unResolvedTroubles.some((trouble) => trouble.id === entryId)
    }
    return false
  }

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
    setAppealsAndTroublesState((prev) => {
      if (!prev) {
        return prev
      }

      const updatedEntries = prev.appealsAndTroublesEntry.troubles.entries.map((e) =>
        e.id === id ? { ...e, resolved } : e,
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
      <Button size="square-petite" onPress={handleAdd} className="mt-4 rounded-full">
        <IconPlus />
      </Button>
      {entries.map((entry, index) => {
        const namePrefix = kind === 'appeal' ? 'appealEntries' : 'troubleEntries'

        return (
          <div
            key={entry.id}
            className="mx-auto grid grid-cols-12 grid-rows-1 items-center gap-4 py-2"
          >
            {/* Hidden inputs for form data structure */}
            <input type="hidden" name={`${namePrefix}[${index}].id`} value={entry.id} />
            <input
              type="hidden"
              name={`${namePrefix}[${index}].content`}
              value={entry.content || ''}
            />
            <input
              type="hidden"
              name={`${namePrefix}[${index}].categoryId`}
              value={entry.item || ''}
            />

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
            {isExistingTrouble(entry.id) ? (
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
      })}

      {entries.length >= 1 && (
        <Button size="square-petite" onPress={handleAdd} className="mt-4 rounded-full">
          <IconPlus />
        </Button>
      )}
    </>
  )
}
