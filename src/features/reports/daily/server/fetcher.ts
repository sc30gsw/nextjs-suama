import type { InferResponseType } from 'hono'
import 'server-only'
import { unstable_cacheTag as cacheTag } from 'next/cache'
import { format } from 'date-fns'
import {
  GET_DAILY_REPORTS_FOR_MINE_CACHE_KEY,
  GET_DAILY_REPORTS_FOR_TODAY_CACHE_KEY,
  GET_DAILY_REPORT_BY_ID_CACHE_KEY,
} from '~/constants/cache-keys'
import { upfetch } from '~/lib/fetcher'
import { client } from '~/lib/rpc'

export async function getReportsForToday(
  params: { skip: number; limit: number; userNames?: string[] },
  userId?: string,
) {
  'use cache'; cacheTag(`${GET_DAILY_REPORTS_FOR_TODAY_CACHE_KEY}-${format(new Date(), 'yyyy-MM-dd')}`)

  const url = client.api.dailies.today.$url()
  type ResType = InferResponseType<typeof client.api.dailies.today.$get, 200>

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

export async function getReportsForMine(
  params: { skip: number; limit: number; startDate?: Date; endDate?: Date },
  userId?: string,
) {
  'use cache'; cacheTag(`${GET_DAILY_REPORTS_FOR_MINE_CACHE_KEY}-${userId}`)

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

export async function getReportById(reportId: string, userId?: string) {
  'use cache'; cacheTag(`${GET_DAILY_REPORT_BY_ID_CACHE_KEY}-${reportId}`)

  const url = client.api.dailies[':id'].$url({ param: { id: reportId } })
  type ResType = InferResponseType<(typeof client.api.dailies)[':id']['$get'], 200>

  const res = await upfetch<ResType>(url, {
    headers: {
      Authorization: userId,
    },
  })

  return res
}
