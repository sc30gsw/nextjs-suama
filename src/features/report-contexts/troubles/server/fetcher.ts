import { unstable_cacheTag as cacheTag } from 'next/cache'
import 'server-only'
import {
  GET_TROUBLE_CATEGORIES_CACHE_KEY,
  GET_UNRESOLVED_TROUBLES_CACHE_KEY,
} from '~/constants/cache-keys'
import type {
  TroubleCategoriesResponse,
  unResolvedTroublesResponse,
} from '~/features/reports/daily/types/api-response'
import { upfetch } from '~/lib/fetcher'
import { client } from '~/lib/rpc'

export async function getTroubles(userId: string) {
  'use cache'
  cacheTag(`${GET_UNRESOLVED_TROUBLES_CACHE_KEY}-${userId}`)

  const url = client.api.troubles.$url()

  const res = await upfetch<unResolvedTroublesResponse>(url, {
    headers: {
      Authorization: userId,
    },
  })

  return res
}

export async function getTroubleCategories(
  params?: { skip: number; limit: number; names: string[] },
  userId?: string,
) {
  'use cache'
  cacheTag(GET_TROUBLE_CATEGORIES_CACHE_KEY)

  const url = client.api.troubles.categories.$url()

  const res = await upfetch<TroubleCategoriesResponse>(url, {
    headers: {
      Authorization: userId,
    },
    params: {
      ...params,
    },
  })

  return res
}
