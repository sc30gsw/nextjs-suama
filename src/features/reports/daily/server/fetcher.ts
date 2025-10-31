import 'server-only'

import type { Session } from 'better-auth'
import type { InferSelectModel } from 'drizzle-orm'
import type { InferResponseType } from 'hono'
import { cacheTag } from 'next/dist/server/use-cache/cache-tag'
import type { z } from 'zod/v4'

import {
  GET_DAILY_PROJECT_SUMMARY_CACHE_KEY,
  GET_DAILY_REPORT_BY_ID_CACHE_KEY,
  GET_DAILY_REPORTS_CACHE_KEY,
  GET_DAILY_REPORTS_COUNT_CACHE_KEY,
} from '~/constants/cache-keys'
import type { dailyReports } from '~/db/schema'
import type {
  DailyReportDetailResponseSchema,
  DailyReportSummaryResponseSchema,
} from '~/features/reports/daily/types/schemas/daily-report-api-schema'
import { upfetch } from '~/lib/fetcher'
import { client } from '~/lib/rpc'

export async function getReportById(
  reportId: InferSelectModel<typeof dailyReports>['id'],
  userId: Session['userId'],
  queryUserId?: string,
) {
  'use cache'
  cacheTag(`${GET_DAILY_REPORT_BY_ID_CACHE_KEY}-${reportId}`)

  const url = client.api.dailies[':id'].$url({
    param: { id: reportId },
    query: { userId: queryUserId },
  })
  type ResType = z.infer<typeof DailyReportDetailResponseSchema>

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
    startDate?: string
    endDate?: string
    userId?: string
    userNames?: string
    today?: string
  },
  authenticatedUserId: Session['userId'],
) {
  'use cache'
  cacheTag(`${GET_DAILY_REPORTS_CACHE_KEY}-${JSON.stringify(params)}`)

  const url = client.api.dailies.$url({
    query: {
      skip: String(params.skip),
      limit: String(params.limit),
      startDate: params.startDate,
      endDate: params.endDate,
      userId: params.userId,
      userNames: params.userNames,
      today: params.today,
    },
  })
  type ResType = InferResponseType<typeof client.api.dailies.$get, 200>

  const res = await upfetch<ResType>(url, {
    headers: {
      Authorization: authenticatedUserId,
    },
  })

  return res
}

export async function getDailyReportsCount(
  params: { startDate?: string; endDate?: string; userId?: string; userNames?: string },
  authenticatedUserId: Session['userId'],
) {
  'use cache'
  cacheTag(`${GET_DAILY_REPORTS_COUNT_CACHE_KEY}-${JSON.stringify(params)}`)

  const url = client.api.dailies.count.$url({
    query: {
      startDate: params.startDate,
      endDate: params.endDate,
      userId: params.userId,
      userNames: params.userNames,
    },
  })
  type ResType = InferResponseType<typeof client.api.dailies.count.$get, 200>

  const res = await upfetch<ResType>(url, {
    headers: {
      Authorization: authenticatedUserId,
    },
  })

  return res
}

export async function getProjectSummary(
  params: {
    skip: number
    limit: number
    startDate?: string
    endDate?: string
    userId?: string
    userNames?: string
  },
  authenticatedUserId: Session['userId'],
) {
  'use cache'
  cacheTag(`${GET_DAILY_PROJECT_SUMMARY_CACHE_KEY}-${JSON.stringify(params)}`)

  const url = client.api.dailies.summary.$url({
    query: {
      skip: String(params.skip),
      limit: String(params.limit),
      startDate: params.startDate,
      endDate: params.endDate,
      userId: params.userId,
      userNames: params.userNames,
    },
  })
  type ResType = z.infer<typeof DailyReportSummaryResponseSchema>

  const res = await upfetch<ResType>(url, {
    headers: {
      Authorization: authenticatedUserId,
    },
  })

  return res
}
