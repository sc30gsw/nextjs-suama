import type { Session } from 'better-auth'
import { cacheTag } from 'next/cache'
import 'server-only'
import { GET_TROUBLE_CATEGORIES_CACHE_KEY } from '~/constants/cache-keys'
import { api } from '~/lib/rpc'

export async function getTroubleCategories(
  userId: Session['userId'],
  params?: {
    skip?: number
    limit?: number
    names?: string[]
    withData?: boolean
    sortBy?: 'name'
    sortOrder?: 'asc' | 'desc'
  },
) {
  'use cache'
  // withDataがtrueの場合、ユーザー固有のキャッシュキーを追加して、他の場所でrevalidateできるようにする
  const cacheKey = params?.withData
    ? `${GET_TROUBLE_CATEGORIES_CACHE_KEY}-${userId}`
    : GET_TROUBLE_CATEGORIES_CACHE_KEY
  cacheTag(cacheKey)

  const res = await api.troubles.categories.get({
    headers: {
      Authorization: userId,
    },
    query: {
      skip: params?.skip?.toString(),
      limit: params?.limit?.toString(),
      names: params?.names?.join(','),
      withData: params?.withData?.toString(),
      sortBy: params?.sortBy,
      sortOrder: params?.sortOrder,
    },
  })

  return res.data
}
