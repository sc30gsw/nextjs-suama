import type { Session } from 'better-auth'
import type { InferResponseType } from 'hono'
import { cacheTag } from 'next/cache'
import 'server-only'
import { GET_CLIENTS_CACHE_KEY } from '~/constants/cache-keys'
import { upfetch } from '~/lib/fetcher'
import { client } from '~/lib/rpc'

export async function getClients(
  userId: Session['userId'],
  params?: {
    skip: number
    limit: number
    names: string[]
    sortBy?: 'name' | 'status' | null
    sortOrder?: 'asc' | 'desc' | null
  },
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
      sortBy: params?.sortBy ?? undefined,
      sortOrder: params?.sortOrder ?? undefined,
    },
  })

  return res
}
