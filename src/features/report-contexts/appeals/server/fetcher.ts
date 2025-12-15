import type { Session } from 'better-auth'
import type { InferSelectModel } from 'drizzle-orm'
import { cacheTag } from 'next/cache'
import 'server-only'
import { GET_APPEAL_CATEGORIES_CACHE_KEY } from '~/constants/cache-keys'
import type { dailyReports } from '~/db/schema'
import type { AppealCategoriesResponse } from '~/features/reports/daily/types/api-response'
import { upfetch } from '~/lib/fetcher'
import { client } from '~/lib/rpc'

export async function getAppealCategories(
  userId: Session['userId'],
  params?: {
    skip?: number
    limit?: number
    names?: string[]
    withData?: boolean
    reportId?: InferSelectModel<typeof dailyReports>['id']
    sortBy?: 'name' | 'status' | null
    sortOrder?: 'asc' | 'desc' | null
  },
) {
  'use cache'
  const cacheKey =
    params?.withData && params?.reportId
      ? `${GET_APPEAL_CATEGORIES_CACHE_KEY}-${params.reportId}`
      : GET_APPEAL_CATEGORIES_CACHE_KEY
  cacheTag(cacheKey)

  const url = client.api.appeals.categories.$url()

  const res = await upfetch<AppealCategoriesResponse>(url, {
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
