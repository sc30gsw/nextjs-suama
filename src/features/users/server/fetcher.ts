import 'server-only'

import type { Session } from 'better-auth'
import { cacheTag } from 'next/cache'
import { GET_USERS_CACHE_KEY } from '~/constants/cache-keys'
import { api } from '~/lib/rpc'

export async function getUsers(
  userId: Session['userId'],
  params?: {
    skip?: number
    limit?: number
    userNames?: string[]
    retirementStatus?: 'all' | 'active' | 'retired'
    sortBy?: 'name' | 'status'
    sortOrder?: 'asc' | 'desc'
  },
) {
  'use cache'
  cacheTag(GET_USERS_CACHE_KEY)

  const res = await api.users.get({
    headers: {
      Authorization: userId,
    },
    query: {
      skip: params?.skip?.toString(),
      limit: params?.limit?.toString(),
      userNames: params?.userNames?.join(','),
      retirementStatus: params?.retirementStatus,
      sortBy: params?.sortBy,
      sortOrder: params?.sortOrder,
    },
  })

  return res.data
}
