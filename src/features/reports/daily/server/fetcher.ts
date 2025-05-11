import type { InferResponseType } from 'hono'
import 'server-only'
import { upfetch } from '~/lib/fetcher'
import { client } from '~/lib/rpc'

export async function getReportsForToday(userId?: string) {
  // 'use cache'
  // cacheTag(GET_TROUBLES_CACHE_KEY)

  const url = client.api.dailies.today.$url()
  type ResType = InferResponseType<typeof client.api.dailies.today.$get, 200>

  const res = await upfetch<ResType>(url, {
    headers: {
      Authorization: userId,
    },
  })

  return res
}
