'use client'

import { IconPlus } from '@intentui/icons'
import { Button } from '~/components/ui/intent-ui/button'
import type { Kind } from '~/features/reports/daily/components/report-appeal-or-trouble-container'
import { ReportEntryForm } from '~/features/reports/daily/components/report-entry-form'
import { useAppealOrTroubleEntries } from '~/features/reports/daily/hooks/use-appeal-or-trouble-entries'
import type {
  AppealCategoriesResponse,
  TroubleCategoriesResponse,
} from '~/features/reports/daily/types/api-response'

type ReportAppealAndTroublesInputEntriesProps<
  T extends
    | AppealCategoriesResponse['appealCategories']
    | TroubleCategoriesResponse['troubleCategories'],
> = {
  items: T
  kind: Kind
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
  const {
    entries,
    mutableUnresolvedTroubles,
    mutableExistingAppeals,
    handleAdd,
    handleRemove,
    handleChangeContent,
    handleChangeItem,
    handleChangeResolved,
  } = useAppealOrTroubleEntries({
    kind,
    unResolvedTroubles,
    existingAppeals,
  })

  return (
    <>
      <Button size="square-petite" onPress={handleAdd} className="mt-4 rounded-full">
        <IconPlus />
      </Button>

      {kind === 'trouble' &&
        mutableUnresolvedTroubles.map((entry, index) => (
          <ReportEntryForm
            key={entry.id}
            entry={{
              id: entry.id,
              content: entry.trouble,
              item: entry.categoryOfTroubleId,
              resolved: entry.resolved,
            }}
            index={index}
            isExisting={true}
            kind={kind}
            items={items}
            onChangeContent={handleChangeContent}
            onChangeItem={handleChangeItem}
            onChangeResolved={handleChangeResolved}
            onRemove={handleRemove}
          />
        ))}

      {kind === 'appeal' &&
        mutableExistingAppeals.map((entry, index) => (
          <ReportEntryForm
            key={entry.id}
            entry={{
              id: entry.id,
              content: entry.appeal,
              item: entry.categoryOfAppealId,
              resolved: undefined,
            }}
            index={index}
            isExisting={true}
            kind={kind}
            items={items}
            onChangeContent={handleChangeContent}
            onChangeItem={handleChangeItem}
            onChangeResolved={handleChangeResolved}
            onRemove={handleRemove}
          />
        ))}

      {entries.map((entry, index) => (
        <ReportEntryForm
          key={entry.id}
          entry={{
            id: entry.id,
            content: entry.content,
            item: entry.item,
            resolved: entry.resolved,
          }}
          index={
            index +
            (kind === 'trouble' ? mutableUnresolvedTroubles.length : mutableExistingAppeals.length)
          }
          isExisting={false}
          kind={kind}
          items={items}
          onChangeContent={handleChangeContent}
          onChangeItem={handleChangeItem}
          onChangeResolved={handleChangeResolved}
          onRemove={handleRemove}
        />
      ))}

      {entries.length >= 1 && (
        <Button size="square-petite" onPress={handleAdd} className="mt-4 rounded-full">
          <IconPlus />
        </Button>
      )}
    </>
  )
}
