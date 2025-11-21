import type { Session } from 'better-auth'
import type { InferResponseType } from 'hono'
import { unstable_cacheTag as cacheTag } from 'next/cache'
import 'server-only'
import { GET_MISSIONS_CACHE_KEY } from '~/constants/cache-keys'
import { upfetch } from '~/lib/fetcher'
import { client } from '~/lib/rpc'

export async function getMissions(
  userId: Session['userId'],
  params?: { skip?: number; limit?: number; names?: string[]; isArchived?: boolean },
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
      skip: params?.skip?.toString(),
      limit: params?.limit?.toString(),
      names: params?.names?.join(','),
      isArchived: params?.isArchived?.toString(),
    },
  })

  return res
}
