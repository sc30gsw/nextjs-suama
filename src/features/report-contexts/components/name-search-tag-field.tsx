'use client'

import { useQueryStates } from 'nuqs'
import { useListData } from 'react-stately'
import { TagField } from '~/components/ui/intent-ui/tag-field'
import { projectSearchParamsParsers } from '~/features/report-contexts/projects/types/search-params/project-search-params-cache'
import { nameSearchParamsParsers } from '~/features/report-contexts/types/search-params/name-search-params-cache'

function NameSearchTagFieldDefault({ label }: Record<'label', string>) {
  const [{ names }, setQuery] = useQueryStates(nameSearchParamsParsers, {
    history: 'push',
    shallow: false,
  })

  const namesArray = names ?? []

  const selectedItems = useListData({
    initialItems: namesArray.map((name, i) => ({
      id: i,
      name,
    })),
  })

  return (
    <TagField
      appearance="outline"
      label={label}
      placeholder={namesArray.length > 0 ? '' : `${label}（複数選択可）で検索できます`}
      list={selectedItems}
      onItemInserted={(key) => {
        setQuery({ names: [...namesArray, key.name] })
      }}
      onItemCleared={(key) => {
        setQuery({
          names: namesArray.filter((name) => name !== key?.name),
        })
      }}
      className="max-w-2xl"
    />
  )
}

function NameSearchTagFieldProject({ label }: Parameters<typeof NameSearchTagFieldDefault>[0]) {
  const [{ names }, setQuery] = useQueryStates(projectSearchParamsParsers, {
    history: 'push',
    shallow: false,
  })

  const namesArray = names ?? []

  const selectedItems = useListData({
    initialItems: namesArray.map((name, i) => ({
      id: i,
      name,
    })),
  })

  return (
    <TagField
      appearance="outline"
      label={label}
      placeholder={namesArray.length > 0 ? '' : `${label}（複数選択可）で検索できます`}
      list={selectedItems}
      onItemInserted={(key) => {
        setQuery({ names: [...namesArray, key.name] })
      }}
      onItemCleared={(key) => {
        setQuery({
          names: namesArray.filter((name) => name !== key?.name),
        })
      }}
      className="max-w-2xl"
    />
  )
}

export function NameSearchTagField<T extends 'project' | undefined = undefined>({
  label,
  type,
}: Parameters<typeof NameSearchTagFieldDefault>[0] &
  (T extends 'project' ? Record<'type', T> : Partial<Record<'type', T>>)) {
  return type === 'project' ? (
    <NameSearchTagFieldProject label={label} />
  ) : (
    <NameSearchTagFieldDefault label={label} />
  )
}
