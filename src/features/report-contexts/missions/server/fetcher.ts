import type { InferSelectModel } from 'drizzle-orm'
import type { InferResponseType } from 'hono'
import { unstable_cacheTag as cacheTag } from 'next/cache'
import 'server-only'
import { GET_MISSIONS_CACHE_KEY } from '~/constants/cache-keys'
import type { users } from '~/db/schema'
import { upfetch } from '~/lib/fetcher'
import { client } from '~/lib/rpc'

export async function getMissions(
  userId: InferSelectModel<typeof users>['id'],
  params?: { skip: number; limit: number; names: string[] },
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
