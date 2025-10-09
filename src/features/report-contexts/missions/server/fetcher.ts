import type { InferResponseType } from 'hono'
import 'server-only'
import { unstable_cacheTag as cacheTag } from 'next/cache'
import { GET_MISSIONS_CACHE_KEY } from '~/constants/cache-keys'
import { upfetch } from '~/lib/fetcher'
import { client } from '~/lib/rpc'

export async function getMissions(
  params?: { skip: number; limit: number; names: string[] },
  userId?: string,
) {
  'use cache'
  cacheTag(GET_MISSIONS_CACHE_KEY)

  const url = client.api.missions.$url()
  type ResType = InferResponseType<typeof client.api.missions.$get, 200>

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
