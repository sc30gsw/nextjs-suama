import type { InferResponseType } from 'hono'
import type { client } from '~/lib/rpc'

export type AppealResponse = InferResponseType<
  typeof client.api.appeals.$get,
  200
>
export type TroubleResponse = InferResponseType<
  typeof client.api.troubles.$get,
  200
>
