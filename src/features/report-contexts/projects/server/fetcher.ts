import type { Session } from 'better-auth'
import { cacheTag } from 'next/cache'
import 'server-only'
import { GET_PROJECTS_CACHE_KEY } from '~/constants/cache-keys'
import { api } from '~/lib/rpc'

export async function getProjects(
  userId: Session['userId'],
  params?: {
    skip?: number
    limit?: number
    names?: string[]
    archiveStatus?: 'all' | 'active' | 'archived'
    sortBy?: 'name' | 'status' | 'clientName' | null
    sortOrder?: 'asc' | 'desc' | null
  },
) {
  'use cache'
  cacheTag(GET_PROJECTS_CACHE_KEY)

  const res = await api.projects.get({
    headers: {
      Authorization: userId,
    },
    query: {
      skip: params?.skip?.toString(),
      limit: params?.limit?.toString(),
      names: params?.names?.join(','),
      archiveStatus: params?.archiveStatus,
      sortBy: params?.sortBy ?? undefined,
      sortOrder: params?.sortOrder ?? undefined,
    },
  })

  return res.data
}
