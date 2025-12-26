import { count, like, or } from 'drizzle-orm'
import { QUERY_DEFAULT_PARAMS, QUERY_MAX_LIMIT_VALUES } from '~/constants'
import { clients } from '~/db/schema'
import { getDb } from '~/index'
import {
  ClientNotFoundError,
  ClientServiceError,
} from '~/features/report-contexts/clients/api/errors'
import type { ClientModel } from '~/features/report-contexts/clients/api/model'

export abstract class ClientService {
  static async getClients(params: ClientModel.getClientsQuery) {
    try {
      const db = getDb()
      const { skip, limit, names, sortBy, sortOrder } = params

      const skipNumber = Number(skip) || QUERY_DEFAULT_PARAMS.SKIP
      const limitNumber = Number(limit) || QUERY_MAX_LIMIT_VALUES.GENERAL
      const namesArray = names ? names.split(',').map((name) => name.trim()) : []
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
        orderBy: (clientsTable, { asc: ascFn, desc: descFn }) => {
          const orderByArray = []

          if (sortBy && sortOrder && sortBy === 'name') {
            orderByArray.push(
              sortOrder === 'asc' ? ascFn(clientsTable.name) : descFn(clientsTable.name),
            )
          }

          orderByArray.push(ascFn(clientsTable.createdAt))

          return orderByArray
        },
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
      if (error instanceof ClientServiceError || error instanceof ClientNotFoundError) {
        throw error
      }

      throw new ClientServiceError(
        `Failed to get clients: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
