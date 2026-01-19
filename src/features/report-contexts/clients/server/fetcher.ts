import type { Session } from 'better-auth'
import { cacheTag } from 'next/cache'
import 'server-only'
import { GET_CLIENTS_CACHE_KEY } from '~/constants/cache-keys'
import { api } from '~/lib/rpc'

export async function getClients(
  userId: Session['userId'],
  params?: {
    skip: number
    limit: number
    names: string[]
    sortBy?: 'name'
    sortOrder?: 'asc' | 'desc'
  },
) {
  'use cache'
  cacheTag(GET_CLIENTS_CACHE_KEY)

  const res = await api.clients.get({
    headers: {
      Authorization: userId,
    },
    query: {
      skip: params?.skip?.toString(),
      limit: params?.limit?.toString(),
      names: params?.names?.join(','),
      sortBy: params?.sortBy,
      sortOrder: params?.sortOrder,
    },
  })

  return res.data
}
