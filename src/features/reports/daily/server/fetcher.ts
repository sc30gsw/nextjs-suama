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

export async function getDailyReportById(
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
    startDate?: Date
    endDate?: Date
    userId?: string
    userNames?: string[]
    today?: boolean
  },
  userId: Session['userId'],
) {
  'use cache'
  cacheTag(GET_DAILY_REPORTS_CACHE_KEY)

  const url = client.api.dailies.$url()
  type ResType = InferResponseType<typeof client.api.dailies.$get, 200>

  const res = await upfetch<ResType>(url, {
    headers: {
      Authorization: userId,
    },
    params: {
      ...params,
    },
  })

  return res
}

export async function getDailyReportsCount(
  params: { startDate?: Date; endDate?: Date; userId?: string; userNames?: string[] },
  userId?: Session['userId'],
) {
  'use cache'
  cacheTag(GET_DAILY_REPORTS_COUNT_CACHE_KEY)

  const url = client.api.dailies.count.$url()
  type ResType = InferResponseType<typeof client.api.dailies.count.$get, 200>

  const res = await upfetch<ResType>(url, {
    headers: {
      Authorization: userId,
    },
    params: {
      ...params,
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
  cacheTag(GET_DAILY_PROJECT_SUMMARY_CACHE_KEY)

  const url = client.api.dailies.summary.$url()
  type ResType = z.infer<typeof DailyReportSummaryResponseSchema>

  const res = await upfetch<ResType>(url, {
    headers: {
      Authorization: userId,
    },
    params: {
      ...params,
    },
  })

  return res
}
