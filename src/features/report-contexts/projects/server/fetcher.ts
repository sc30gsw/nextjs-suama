import type { InferResponseType } from 'hono'
import { unstable_cacheTag as cacheTag } from 'next/cache'
import 'server-only'
import { GET_PROJECTS_CACHE_KEY } from '~/constants/cache-keys'
import type { auth } from '~/lib/auth'
import { upfetch } from '~/lib/fetcher'
import { client } from '~/lib/rpc'

export async function getProjects(
  userId: typeof auth.$Infer.Session.user.id,
  params?: { skip: number; limit: number; names: string[] },
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
