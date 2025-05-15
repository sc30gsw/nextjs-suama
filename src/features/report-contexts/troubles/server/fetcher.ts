import type { InferResponseType } from 'hono'
import 'server-only'
import { unstable_cacheTag as cacheTag } from 'next/cache'
import { GET_TROUBLES_CACHE_KEY } from '~/constants/cache-keys'
import { upfetch } from '~/lib/fetcher'
import { client } from '~/lib/rpc'

export async function getTroubles(userId?: string) {
  'use cache'
  cacheTag(GET_TROUBLES_CACHE_KEY)

  const url = client.api.troubles.$url()
  type ResType = InferResponseType<typeof client.api.troubles.$get, 200>

  const res = await upfetch<ResType>(url, {
    headers: {
      Authorization: userId,
    },
  })

  return res.todos
}
