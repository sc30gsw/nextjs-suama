import type { InferResponseType } from 'hono'
import 'server-only'
import { unstable_cacheTag as cacheTag } from 'next/cache'
import { GET_TROUBLE_CATEGORIES_CACHE_KEY } from '~/constants/cache-keys'
import { upfetch } from '~/lib/fetcher'
import { client } from '~/lib/rpc'

export async function getTroubleCategories(
  params?: { skip: number; limit: number; names: string[] },
  userId?: string,
) {
  'use cache'
  cacheTag(GET_TROUBLE_CATEGORIES_CACHE_KEY)

  const url = client.api.troubles.categories.$url()
  type ResType = InferResponseType<
    typeof client.api.troubles.categories.$get,
    200
  >

  const res = await upfetch<ResType>(url, {
    headers: {
      Authorization: userId,
    },
    params: {
      ...params,
    },
  })

  return res
}
