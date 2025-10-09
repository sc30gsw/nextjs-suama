import type { InferResponseType } from 'hono'
import type { client } from '~/lib/rpc'

export type AppealCategoriesResponse = InferResponseType<
  typeof client.api.appeals.categories.$get,
  200
>

export type TroubleCategoriesResponse = InferResponseType<
  typeof client.api.troubles.categories.$get,
  200
>

export type WorkContentResponse = InferResponseType<
  typeof client.api.dailies.today.$get,
  200
>['users'][number]['workContents'][number]
