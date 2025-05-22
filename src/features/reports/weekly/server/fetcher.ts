import type { InferRequestType, InferResponseType } from 'hono'
import 'server-only'
import { unstable_cacheTag as cacheTag } from 'next/cache'
import {
  GET_LAST_WEEKLY_REPORT_MISSIONS_CACHE_KEY,
  GET_WEEKLY_REPORT_MISSIONS_BY_ID_CACHE_KEY,
  GET_WEEKLY_REPORT_MISSIONS_CACHE_KEY,
} from '~/constants/cache-keys'
import { upfetch } from '~/lib/fetcher'
import { client } from '~/lib/rpc'

export async function getWeeklyReportMissionsById(
  params: InferRequestType<
    (typeof client.api.weeklies)[':weeklyReportId']['$get']
  >['param'],
  userId?: string,
) {
  'use cache'
  cacheTag(
    `${GET_WEEKLY_REPORT_MISSIONS_BY_ID_CACHE_KEY}-${params.weeklyReportId}`,
  )

  const url = client.api.weeklies[':weeklyReportId'].$url({
    param: params,
  })
  type ResType = InferResponseType<
    (typeof client.api.weeklies)[':weeklyReportId']['$get'],
    200
  >

  const res = await upfetch<ResType>(url, {
    headers: {
      Authorization: userId,
    },
  })

  return res
}

export async function getWeeklyReportMissions(
  params: InferRequestType<
    (typeof client.api.weeklies)['current-user'][':year'][':week']['$get']
  >['param'],
  userId?: string,
) {
  'use cache'
  cacheTag(
    `${GET_WEEKLY_REPORT_MISSIONS_CACHE_KEY}-${params.year}-${params.week}-${userId}`,
  )

  const url = client.api.weeklies['current-user'][':year'][':week'].$url({
    param: params,
  })
  type ResType = InferResponseType<
    (typeof client.api.weeklies)['current-user'][':year'][':week']['$get'],
    200
  >

  const res = await upfetch<ResType>(url, {
    headers: {
      Authorization: userId,
    },
  })

  return res
}

export async function getLastWeeklyReportMissions(
  params: InferRequestType<
    (typeof client.api.weeklies)['last-week'][':year'][':week']['$get']
  >['param'],
  userId?: string,
) {
  'use cache'
  cacheTag(
    `${GET_LAST_WEEKLY_REPORT_MISSIONS_CACHE_KEY}-${params.year}-${params.week}-${userId}`,
  )

  const url = client.api.weeklies['last-week'][':year'][':week'].$url({
    param: params,
  })
  type ResType = InferResponseType<
    (typeof client.api.weeklies)['last-week'][':year'][':week']['$get'],
    200
  >

  const res = await upfetch<ResType>(url, {
    headers: {
      Authorization: userId,
    },
  })

  return res
}
