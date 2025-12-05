'use client'

import { useQueryStates } from 'nuqs'
import { useListData } from 'react-stately'
import { TagField } from '~/components/ui/intent-ui/tag-field'
import { userSearchParamsParsers } from '~/features/users/types/search-params/user-search-params-cache'

export function UserSearchTagField() {
  const [{ userNames }, setQuery] = useQueryStates(userSearchParamsParsers, {
    history: 'push',
    shallow: false,
  })

  const selectedItems = useListData({
    initialItems: userNames.map((name, i) => ({
      id: i,
      name,
    })),
  })

  return (
    <TagField
      name="userNames"
      appearance="outline"
      label="ユーザー名・メールアドレス"
      placeholder={
        userNames.length > 0 ? '' : 'ユーザー名・メールアドレス（複数選択可）で検索できます'
      }
      list={selectedItems}
      onItemInserted={(key) => {
        setQuery({ userNames: [...userNames, key.name] })
      }}
      onItemCleared={(key) => {
        setQuery({
          userNames: userNames.filter((name) => name !== key?.name),
        })
      }}
      className="max-w-2xl"
    />
  )
}
