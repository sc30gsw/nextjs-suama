import 'server-only'

import type { Session } from 'better-auth'
import type { InferSelectModel } from 'drizzle-orm'
import type { InferResponseType } from 'hono'
import { cacheTag } from 'next/dist/server/use-cache/cache-tag'

import {
  GET_DAILY_PROJECT_SUMMARY_CACHE_KEY,
  GET_DAILY_REPORT_BY_ID_CACHE_KEY,
  GET_DAILY_REPORTS_CACHE_KEY,
  GET_DAILY_REPORTS_COUNT_CACHE_KEY,
} from '~/constants/cache-keys'
import type { dailyReports, users } from '~/db/schema'
import { upfetch } from '~/lib/fetcher'
import { client } from '~/lib/rpc'
import { dateUtils } from '~/utils/date-utils'

export async function getDailyReportById(
  reportId: InferSelectModel<typeof dailyReports>['id'],
  userId: Session['userId'],
) {
  'use cache'
  cacheTag(`${GET_DAILY_REPORT_BY_ID_CACHE_KEY}-${reportId}`)

  const url = client.api.dailies[':id'].$url({
    param: { id: reportId },
  })
  type ResType = InferResponseType<(typeof client.api.dailies)[':id']['$get'], 200>

  const res = await upfetch<ResType>(url, {
    headers: {
      Authorization: userId,
    },
  })

  return res
}

export async function getDailyReports(
  params: {
    skip: number
    limit: number
    startDate?: Date
    endDate?: Date
    userId?: InferSelectModel<typeof users>['id']
    userNames?: string[]
  },
  userId: Session['userId'],
) {
  'use cache'
  const targetUserId = params.userId || 'every'
  cacheTag(`${GET_DAILY_REPORTS_CACHE_KEY}-${targetUserId}`)

  const url = client.api.dailies.$url()
  type ResType = InferResponseType<typeof client.api.dailies.$get, 200>

  const res = await upfetch<ResType>(url, {
    headers: {
      Authorization: userId,
    },
    params: {
      ...params,
      startDate: params.startDate ? dateUtils.formatDateByJST(params.startDate) : undefined,
      endDate: params.endDate ? dateUtils.formatDateByJST(params.endDate) : undefined,
    },
  })

  return res
}

export async function getDailyReportsCount(
  params: { startDate?: Date; endDate?: Date; userId?: string; userNames?: string[] },
  userId?: Session['userId'],
) {
  'use cache'
  const targetUserId = params.userId || 'every'
  cacheTag(`${GET_DAILY_REPORTS_COUNT_CACHE_KEY}-${targetUserId}`)

  const url = client.api.dailies.count.$url()
  type ResType = InferResponseType<typeof client.api.dailies.count.$get, 200>

  const res = await upfetch<ResType>(url, {
    headers: {
      Authorization: userId,
    },
    params: {
      ...params,
      startDate: params.startDate ? dateUtils.formatDateByJST(params.startDate) : undefined,
      endDate: params.endDate ? dateUtils.formatDateByJST(params.endDate) : undefined,
    },
  })

  return res
}

export async function getProjectSummary(
  params: {
    skip: number
    limit: number
    startDate?: Date
    endDate?: Date
    userId?: string
    userNames?: string[]
  },
  userId: Session['userId'],
) {
  'use cache'
  const targetUserId = params.userId || 'every'
  cacheTag(`${GET_DAILY_PROJECT_SUMMARY_CACHE_KEY}-${targetUserId}`)

  const url = client.api.dailies.summary.$url()
  type ResType = InferResponseType<(typeof client.api.dailies)['summary']['$get'], 200>

  const res = await upfetch<ResType>(url, {
    headers: {
      Authorization: userId,
    },
    params: {
      ...params,
      startDate: params.startDate ? dateUtils.formatDateByJST(params.startDate) : undefined,
      endDate: params.endDate ? dateUtils.formatDateByJST(params.endDate) : undefined,
    },
  })

  return res
}
