import type { InferResponseType } from 'hono'
import { unstable_cacheTag as cacheTag } from 'next/cache'
import 'server-only'
import { GET_USERS_CACHE_KEY } from '~/constants/cache-keys'
import type { auth } from '~/lib/auth'
import { upfetch } from '~/lib/fetcher'
import { client } from '~/lib/rpc'

export async function getUsers(
  userId: typeof auth.$Infer.Session.user.id,
  params?: { skip: number; limit: number; userNames: string[] },
) {
  'use cache'
  cacheTag(GET_USERS_CACHE_KEY)

  const url = client.api.users.$url()
  type ResType = InferResponseType<typeof client.api.users.$get, 200>

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
