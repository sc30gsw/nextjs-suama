import 'server-only'

import type { Session } from 'better-auth'
import type { InferResponseType } from 'hono'
import { cacheTag } from 'next/cache'
import { GET_USERS_CACHE_KEY } from '~/constants/cache-keys'
import { upfetch } from '~/lib/fetcher'
import { client } from '~/lib/rpc'

export async function getUsers(
  userId: Session['userId'],
  params?: {
    skip?: number
    limit?: number
    userNames?: string[]
    retirementStatus?: 'all' | 'active' | 'retired'
  },
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
      skip: params?.skip?.toString(),
      limit: params?.limit?.toString(),
      userNames: params?.userNames?.join(','),
      retirementStatus: params?.retirementStatus,
    },
  })

  return res
}
