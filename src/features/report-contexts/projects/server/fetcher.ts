import type { InferResponseType } from 'hono'
import 'server-only'
import { unstable_cacheTag as cacheTag } from 'next/cache'
import { GET_PROJECTS_CACHE_KEY } from '~/constants/cache-keys'
import { upfetch } from '~/lib/fetcher'
import { client } from '~/lib/rpc'

export async function getProjects(
  params?: { skip: number; limit: number; names: string[] },
  userId?: string,
) {
  'use cache'
  cacheTag(GET_PROJECTS_CACHE_KEY)

  const url = client.api.projects.$url()
  type ResType = InferResponseType<typeof client.api.projects.$get, 200>

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
