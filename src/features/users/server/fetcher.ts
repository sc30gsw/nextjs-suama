import type { InferResponseType } from 'hono'
import 'server-only'
import { unstable_cacheTag as cacheTag } from 'next/cache'
import { GET_USERS_CACHE_KEY } from '~/constants/cache-keys'
import { upfetch } from '~/lib/fetcher'
import { client } from '~/lib/rpc'

export async function getUsers(
  params?: { skip: number; limit: number; userNames: string[] },
  userId?: string,
) {
  'use cache'
  cacheTag(GET_USERS_CACHE_KEY)

  const url = client.api.users.$url()
  type ResType = InferResponseType<typeof client.api.users.$get, 200>

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
