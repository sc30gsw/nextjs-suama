import type { InferRequestType, InferResponseType } from 'hono'
import 'server-only'
import { unstable_cacheTag as cacheTag } from 'next/cache'
import { GET_WEEKLY_REPORT_MISSIONS_CACHE_KEY } from '~/constants/cache-keys'
import { upfetch } from '~/lib/fetcher'
import { client } from '~/lib/rpc'

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
