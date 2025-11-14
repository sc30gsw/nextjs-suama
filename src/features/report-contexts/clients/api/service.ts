import type { RouteHandler } from '@hono/zod-openapi'
import { count, like, or } from 'drizzle-orm'
import { API_LIMITS } from '~/constants/api-limits'
import { PAGINATION } from '~/constants/pagination'
import { clients } from '~/db/schema'
import type { getClientsRoute } from '~/features/report-contexts/clients/api/route'
import { db } from '~/index'

export class ClientServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ClientServiceError'
  }
}

export class ClientService {
  async getClients(
    params: ReturnType<Parameters<RouteHandler<typeof getClientsRoute>>[0]['req']['valid']>,
  ) {
    const { skip, limit, names } = params

    const skipNumber = Number(skip) || PAGINATION.VALUES.DEFAULTS.SKIP
    const limitNumber = Number(limit) || API_LIMITS.COMBOBOX_MAX_ITEMS
    const namesArray = names ? names.split(',').map((name) => name.trim()) : []
    try {
      const whereClause =
        namesArray && namesArray.length > 0
          ? or(
              ...namesArray.flatMap((word) => [
                like(clients.name, `%${word}%`),
                like(clients.likeKeywords, `%${word}%`),
              ]),
            )
          : undefined

      const clientList = await db.query.clients.findMany({
        where: whereClause,
        offset: skipNumber,
        limit: limitNumber,
        orderBy: (clientsTable, { asc }) => [asc(clientsTable.createdAt)],
      })

      const total = await db.select({ count: count() }).from(clients).where(whereClause)

      const formattedClients = clientList.map((client) => ({
        ...client,
        createdAt: client.createdAt.toISOString(),
        updatedAt: client.updatedAt?.toISOString() ?? null,
      }))

      return {
        clients: formattedClients,
        total: total[0].count,
        skip: skipNumber,
        limit: limitNumber,
      }
    } catch (error) {
      throw new ClientServiceError(
        `Failed to get clients: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
