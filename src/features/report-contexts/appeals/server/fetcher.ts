import type { Session } from 'better-auth'
import type { InferSelectModel } from 'drizzle-orm'
import { cacheTag } from 'next/cache'
import 'server-only'
import { GET_APPEAL_CATEGORIES_CACHE_KEY } from '~/constants/cache-keys'
import type { dailyReports } from '~/db/schema'
import { api } from '~/lib/rpc'

export async function getAppealCategories(
  userId: Session['userId'],
  params?: {
    skip?: number
    limit?: number
    names?: string[]
    withData?: boolean
    reportId?: InferSelectModel<typeof dailyReports>['id']
    sortBy?: 'name'
    sortOrder?: 'asc' | 'desc'
  },
) {
  'use cache'
  const cacheKey =
    params?.withData && params?.reportId
      ? `${GET_APPEAL_CATEGORIES_CACHE_KEY}-${params.reportId}`
      : GET_APPEAL_CATEGORIES_CACHE_KEY
  cacheTag(cacheKey)

  const res = await api.appeals.categories.get({
    headers: {
      Authorization: userId,
    },
    query: {
      skip: params?.skip?.toString(),
      limit: params?.limit?.toString(),
      names: params?.names?.join(','),
      withData: params?.withData?.toString(),
      reportId: params?.reportId,
      sortBy: params?.sortBy,
      sortOrder: params?.sortOrder,
    },
  })

  return res.data
}
