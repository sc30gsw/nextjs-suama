import type { RouteHandler } from '@hono/zod-openapi'
import { ERROR_STATUS } from '~/constants/error-message'
import {
  ClientService,
  ClientServiceError,
} from '~/features/report-contexts/clients/api/client-service'
import type { getClientsRoute } from '~/features/report-contexts/clients/api/route'

const clientService = new ClientService()

export async function getClientsHandler(c: Parameters<RouteHandler<typeof getClientsRoute>>[0]) {
  const { skip, limit, names } = c.req.valid('query')

  try {
    const result = await clientService.getClients({
      skip,
      limit,
      names,
    })

    return c.json(result, 200)
  } catch (error) {
    if (error instanceof ClientServiceError) {
      console.error('ClientService error:', error.message)
    }
    return c.json(
      {
        error: ERROR_STATUS.SOMETHING_WENT_WRONG,
      },
      500,
    )
  }
}
