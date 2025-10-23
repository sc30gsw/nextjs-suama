import type { Session } from 'better-auth'
import { unstable_cacheTag as cacheTag } from 'next/cache'
import 'server-only'
import { GET_TROUBLE_CATEGORIES_CACHE_KEY } from '~/constants/cache-keys'
import type { TroubleCategoriesResponse } from '~/features/reports/daily/types/api-response'
import { upfetch } from '~/lib/fetcher'
import { client } from '~/lib/rpc'

export async function getTroubleCategories(
  userId: Session['userId'],
  params?: {
    skip?: number
    limit?: number
    names?: string[]
    withData?: boolean
  },
) {
  'use cache'
  // withDataがtrueの場合、ユーザー固有のキャッシュキーを追加して、他の場所でrevalidateできるようにする
  const cacheKey = params?.withData
    ? `${GET_TROUBLE_CATEGORIES_CACHE_KEY}-${userId}`
    : GET_TROUBLE_CATEGORIES_CACHE_KEY
  cacheTag(cacheKey)

  const url = client.api.troubles.categories.$url()

  const res = await upfetch<TroubleCategoriesResponse>(url, {
    headers: {
      Authorization: userId,
    },
    params: {
      ...params,
    },
  })

  return res
}
