'use client'

import type { InferSelectModel } from 'drizzle-orm'
import { useQueryStates } from 'nuqs'
import { useState } from 'react'
import type { Key } from 'react-aria-components'
import type { appeals, troubles } from '~/db/schema'
import type { Kind } from '~/features/reports/daily/components/report-appeal-or-trouble-container'
import type {
  AppealCategoriesResponse,
  TroubleCategoriesResponse,
} from '~/features/reports/daily/types/api-response'
import type { AppealsAndTroublesEntry } from '~/features/reports/daily/types/search-params/input-count-search-params-cache'
import { inputCountSearchParamsParsers } from '~/features/reports/daily/types/search-params/input-count-search-params-cache'

type AppealId = InferSelectModel<typeof appeals>['id']
type TroubleId = InferSelectModel<typeof troubles>['id']

type UseAppealOrTroubleEntriesParams = {
  kind: Kind
  unResolvedTroubles?: TroubleCategoriesResponse['unResolvedTroubles']
  existingAppeals?: AppealCategoriesResponse['existingAppeals']
}

export function useAppealOrTroubleEntries({
  kind,
  unResolvedTroubles,
  existingAppeals,
}: UseAppealOrTroubleEntriesParams) {
  const [{ appealsAndTroublesEntry }, setAppealsAndTroublesState] = useQueryStates(
    inputCountSearchParamsParsers,
    {
      history: 'push',
      shallow: false,
    },
  )

  const [mutableUnresolvedTroubles, setMutableUnresolvedTroubles] = useState(
    unResolvedTroubles ?? [],
  )
  const [mutableExistingAppeals, setMutableExistingAppeals] = useState(existingAppeals ?? [])

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

  const handleRemove = (id: AppealId | TroubleId) => {
    if (kind === 'trouble' && mutableUnresolvedTroubles.some((trouble) => trouble.id === id)) {
      setMutableUnresolvedTroubles((prev) => prev.filter((trouble) => trouble.id !== id))

      return
    }

    if (kind === 'appeal' && mutableExistingAppeals.some((appeal) => appeal.id === id)) {
      setMutableExistingAppeals((prev) => prev.filter((appeal) => appeal.id !== id))

      return
    }

    setAppealsAndTroublesState((prev) => {
      if (!prev) {
        return prev
      }

      if (kind === 'appeal') {
        const filteredEntries = prev.appealsAndTroublesEntry.appeals.entries.filter(
          (entry) => entry.id !== id,
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
        (entry) => entry.id !== id,
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

  const handleChangeContent = (
    id: AppealId | TroubleId,
    newContent: AppealsAndTroublesEntry['content'],
  ) => {
    if (kind === 'trouble' && mutableUnresolvedTroubles.some((trouble) => trouble.id === id)) {
      setMutableUnresolvedTroubles((prev) =>
        prev.map((trouble) => (trouble.id === id ? { ...trouble, trouble: newContent } : trouble)),
      )

      return
    }

    if (kind === 'appeal' && mutableExistingAppeals.some((appeal) => appeal.id === id)) {
      setMutableExistingAppeals((prev) =>
        prev.map((appeal) => (appeal.id === id ? { ...appeal, appeal: newContent } : appeal)),
      )

      return
    }

    setAppealsAndTroublesState((prev) => {
      if (!prev) {
        return prev
      }

      if (kind === 'appeal') {
        const updatedEntries = prev.appealsAndTroublesEntry.appeals.entries.map((entry) =>
          entry.id === id ? { ...entry, content: newContent } : entry,
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

      const updatedEntries = prev.appealsAndTroublesEntry.troubles.entries.map((entry) =>
        entry.id === id ? { ...entry, content: newContent } : entry,
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

  const handleChangeItem = (id: AppealId | TroubleId, newItem: Key | null) => {
    if (kind === 'trouble' && mutableUnresolvedTroubles.some((trouble) => trouble.id === id)) {
      setMutableUnresolvedTroubles((prev) =>
        prev.map((trouble) =>
          trouble.id === id ? { ...trouble, categoryOfTroubleId: String(newItem) } : trouble,
        ),
      )

      return
    }

    if (kind === 'appeal' && mutableExistingAppeals.some((appeal) => appeal.id === id)) {
      setMutableExistingAppeals((prev) =>
        prev.map((appeal) =>
          appeal.id === id ? { ...appeal, categoryOfAppealId: String(newItem) } : appeal,
        ),
      )

      return
    }

    setAppealsAndTroublesState((prev) => {
      if (!prev) {
        return prev
      }

      if (kind === 'appeal') {
        const updatedEntries = prev.appealsAndTroublesEntry.appeals.entries.map((entry) =>
          entry.id === id ? { ...entry, item: newItem ? String(newItem) : null } : entry,
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

      const updatedEntries = prev.appealsAndTroublesEntry.troubles.entries.map((entry) =>
        entry.id === id ? { ...entry, item: newItem ? String(newItem) : null } : entry,
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

  const handleChangeResolved = (
    id: AppealId | TroubleId,
    resolved: NonNullable<AppealsAndTroublesEntry['resolved']>,
  ) => {
    setMutableUnresolvedTroubles((prev) =>
      prev.map((trouble) => (trouble.id === id ? { ...trouble, resolved } : trouble)),
    )
  }

  return {
    entries,
    mutableUnresolvedTroubles,
    mutableExistingAppeals,
    handleAdd,
    handleRemove,
    handleChangeContent,
    handleChangeItem,
    handleChangeResolved,
  } as const
}
