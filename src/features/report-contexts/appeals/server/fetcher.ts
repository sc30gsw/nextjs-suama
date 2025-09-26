import 'server-only'
import { unstable_cacheTag as cacheTag } from 'next/cache'
import { GET_APPEAL_CATEGORIES_CACHE_KEY } from '~/constants/cache-keys'
import type { AppealCategoriesResponse } from '~/features/reports/daily/types/api-response'
import { upfetch } from '~/lib/fetcher'
import { client } from '~/lib/rpc'

export async function getAppealCategories(
  params?: { skip: number; limit: number; names: string[] },
  userId?: string,
) {
  'use cache'
  cacheTag(GET_APPEAL_CATEGORIES_CACHE_KEY)

  const url = client.api.appeals.categories.$url()

  const res = await upfetch<AppealCategoriesResponse>(url, {
    headers: {
      Authorization: userId,
    },
    params: {
      ...params,
    },
  })

  return res
}
