import 'server-only'

import type { Session } from 'better-auth'
import { cacheTag } from 'next/cache'
import {
  GET_LAST_WEEKLY_REPORT_MISSIONS_CACHE_KEY,
  GET_WEEKLY_REPORT_MISSIONS_BY_ID_CACHE_KEY,
  GET_WEEKLY_REPORT_MISSIONS_CACHE_KEY,
} from '~/constants/cache-keys'
import { api } from '~/lib/rpc'
import type { WeeklyReportModel } from '~/features/reports/weekly/api/model'

export async function getWeeklyReportMissionsById(
  params: WeeklyReportModel.getWeeklyReportByIdParams,
  userId: Session['userId'],
) {
  'use cache'
  cacheTag(`${GET_WEEKLY_REPORT_MISSIONS_BY_ID_CACHE_KEY}-${params.weeklyReportId}`)

  const res = await api.weeklies({ weeklyReportId: params.weeklyReportId }).get({
    headers: {
      Authorization: userId,
    },
  })

  return res.data
}

export async function getWeeklyReportMissions(
  params: WeeklyReportModel.getCurrentUserWeeklyReportParams,
  userId: Session['userId'],
) {
  'use cache'
  cacheTag(`${GET_WEEKLY_REPORT_MISSIONS_CACHE_KEY}-${params.year}-${params.week}-${userId}`)

  const res = await api.weeklies['current-user']({ year: params.year })({ week: params.week }).get({
    headers: {
      Authorization: userId,
    },
  })

  return res.data
}

export async function getLastWeeklyReportMissions(
  params: WeeklyReportModel.getLastWeekReportParams,
  userId: Session['userId'],
) {
  'use cache'
  cacheTag(`${GET_LAST_WEEKLY_REPORT_MISSIONS_CACHE_KEY}-${params.year}-${params.week}-${userId}`)

  const res = await api.weeklies['last-week']({ year: params.year })({ week: params.week }).get({
    headers: {
      Authorization: userId,
    },
  })

  return res.data
}
