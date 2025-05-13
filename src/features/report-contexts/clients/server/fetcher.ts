import type { InferResponseType } from 'hono'
import 'server-only'
import { unstable_cacheTag as cacheTag } from 'next/cache'
import { GET_CLIENTS_CACHE_KEY } from '~/constants/cache-keys'
import { upfetch } from '~/lib/fetcher'
import { client } from '~/lib/rpc'

export async function getClients(
  params: { skip: number; limit: number; names?: string[] },
  userId?: string,
) {
  'use cache'
  cacheTag(GET_CLIENTS_CACHE_KEY)

  const url = client.api.clients.$url()
  type ResType = InferResponseType<typeof client.api.clients.$get, 200>

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
