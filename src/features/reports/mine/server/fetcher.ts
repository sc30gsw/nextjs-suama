import 'server-only'

import type { InferResponseType } from 'hono'
import { unstable_cacheTag as cacheTag } from 'next/cache'
import {
  GET_DAILY_REPORTS_COUNT_CACHE_KEY,
  GET_DAILY_REPORTS_FOR_MINE_CACHE_KEY,
  GET_DAILY_REPORTS_FOR_MINE_PROJECT_SUMMARY_CACHE_KEY,
} from '~/constants/cache-keys'
import type { auth } from '~/lib/auth'
import { upfetch } from '~/lib/fetcher'
import { client } from '~/lib/rpc'

export async function getReportsForMine(
  params: { skip: number; limit: number; startDate?: Date; endDate?: Date },
  userId: typeof auth.$Infer.Session.user.id,
) {
  'use cache'
  cacheTag(`${GET_DAILY_REPORTS_FOR_MINE_CACHE_KEY}-${userId}`)

  const url = client.api.dailies.mine.$url()
  type ResType = InferResponseType<typeof client.api.dailies.mine.$get, 200>

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

export async function getProjectSummaryForMine(
  params: { startDate?: Date; endDate?: Date; limit: number; skip: number },
  userId: typeof auth.$Infer.Session.user.id,
) {
  'use cache'
  cacheTag(`${GET_DAILY_REPORTS_FOR_MINE_PROJECT_SUMMARY_CACHE_KEY}-${userId}`)

  const url = client.api.dailies.mine['summary'].$url()
  type ResType = InferResponseType<(typeof client.api.dailies.mine)['summary']['$get'], 200>

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
  params: { scope: 'mine' | 'everyone'; startDate?: Date; endDate?: Date },
  userId: typeof auth.$Infer.Session.user.id,
) {
  'use cache'
  cacheTag(`${GET_DAILY_REPORTS_COUNT_CACHE_KEY}-${userId}`)

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
