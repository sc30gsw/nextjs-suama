import 'server-only'

import type { Session } from 'better-auth'
import type { InferSelectModel } from 'drizzle-orm'
import { cacheTag } from 'next/dist/server/use-cache/cache-tag'

import {
  GET_DAILY_PROJECT_SUMMARY_CACHE_KEY,
  GET_DAILY_REPORT_BY_ID_CACHE_KEY,
  GET_DAILY_REPORTS_CACHE_KEY,
  GET_DAILY_REPORTS_COUNT_CACHE_KEY,
} from '~/constants/cache-keys'
import type { dailyReports, users } from '~/db/schema'
import { api } from '~/lib/rpc'
import { dateUtils } from '~/utils/date-utils'

export async function getDailyReportById(
  reportId: InferSelectModel<typeof dailyReports>['id'],
  userId: Session['userId'],
) {
  'use cache'
  cacheTag(`${GET_DAILY_REPORT_BY_ID_CACHE_KEY}-${reportId}`)

  const res = await api.dailies({ id: reportId }).get({
    headers: {
      Authorization: userId,
    },
  })

  return res.data
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

  const res = await api.dailies.get({
    headers: {
      Authorization: userId,
    },
    query: {
      userId: params.userId,
      userNames: params.userNames?.join(','),
      skip: params.skip.toString(),
      limit: params.limit.toString(),
      startDate: params.startDate ? dateUtils.formatDateByJST(params.startDate) : undefined,
      endDate: params.endDate ? dateUtils.formatDateByJST(params.endDate) : undefined,
    },
  })

  return res.data
}

export async function getDailyReportsCount(
  params: { startDate?: Date; endDate?: Date; userId?: string; userNames?: string[] },
  userId?: Session['userId'],
) {
  'use cache'
  const targetUserId = params.userId || 'every'
  cacheTag(`${GET_DAILY_REPORTS_COUNT_CACHE_KEY}-${targetUserId}`)

  const res = await api.dailies.count.get({
    headers: {
      Authorization: userId,
    },
    query: {
      userId: params.userId,
      userNames: params.userNames?.join(','),
      startDate: params.startDate ? dateUtils.formatDateByJST(params.startDate) : undefined,
      endDate: params.endDate ? dateUtils.formatDateByJST(params.endDate) : undefined,
    },
  })

  return res.data
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

  const res = await api.dailies.summary.get({
    headers: {
      Authorization: userId,
    },
    query: {
      userId: params.userId,
      userNames: params.userNames?.join(','),
      skip: params.skip.toString(),
      limit: params.limit.toString(),
      startDate: params.startDate ? dateUtils.formatDateByJST(params.startDate) : undefined,
      endDate: params.endDate ? dateUtils.formatDateByJST(params.endDate) : undefined,
    },
  })

  return res.data
}
