import type { InferResponseType } from 'hono'
import { upfetch } from '~/lib/fetcher'
import { client } from '~/lib/rpc'

export async function getWeeklyReport(
  params: Record<'year' | 'week', number>,
  offset: number,
  userId?: string,
) {
  const url = client.api.weeklies.$url()
  type ResType = InferResponseType<typeof client.api.weeklies.$get, 200>

  const res = await upfetch<ResType>(url, {
    headers: {
      Authorization: userId,
    },
    params: {
      ...params,
      offset,
    },
  })

  return res
}
