import 'server-only'

import type { Session } from 'better-auth'
import type { InferSelectModel } from 'drizzle-orm'
import type { InferResponseType } from 'hono'
import { unstable_cacheTag as cacheTag } from 'next/cache'
import {
  GET_DAILY_REPORT_BY_ID_CACHE_KEY,
  GET_DAILY_REPORTS_FOR_TODAY_CACHE_KEY,
} from '~/constants/cache-keys'
import type { dailyReports } from '~/db/schema'
import { upfetch } from '~/lib/fetcher'
import { client } from '~/lib/rpc'
import { DATE_FORMAT, dateUtils } from '~/utils/date-utils'

export async function getReportsForToday(
  params: { skip: number; limit: number; userNames?: string[] },
  userId: Session['userId'],
) {
  'use cache'
  const todayJST = dateUtils.formatDateByJST(new Date(), DATE_FORMAT)
  cacheTag(`${GET_DAILY_REPORTS_FOR_TODAY_CACHE_KEY}-${todayJST}`)

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

export async function getReportById(
  reportId: InferSelectModel<typeof dailyReports>['id'],
  userId: Session['userId'],
) {
  'use cache'
  cacheTag(`${GET_DAILY_REPORT_BY_ID_CACHE_KEY}-${reportId}`)

  const url = client.api.dailies[':id'].$url({ param: { id: reportId } })
  type ResType = InferResponseType<(typeof client.api.dailies)[':id']['$get'], 200>

  const res = await upfetch<ResType>(url, {
    headers: {
      Authorization: userId,
    },
  })

  return res
}
