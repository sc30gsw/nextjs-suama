'use client'

import { useQueryStates } from 'nuqs'
import { useListData } from 'react-stately'
import { TagField } from '~/components/ui/intent-ui/tag-field'
import { nameSearchParamsParsers } from '~/features/report-contexts/types/search-params/name-search-params-cache'

export function NameSearchTagField({ label }: Record<'label', string>) {
  const [{ names }, setQuery] = useQueryStates(nameSearchParamsParsers, {
    history: 'push',
    shallow: false,
  })

  const selectedItems = useListData({
    initialItems: names.map((name, i) => ({
      id: i,
      name,
    })),
  })

  return (
    <TagField
      appearance="outline"
      label={label}
      placeholder={`${label}（複数選択可）で検索できます`}
      list={selectedItems}
      onItemInserted={(key) => {
        setQuery({ names: [...names, key.name] })
      }}
      onItemCleared={(key) => {
        setQuery({
          names: names.filter((name) => name !== key?.name),
        })
      }}
      className="max-w-2xl"
    />
  )
}
