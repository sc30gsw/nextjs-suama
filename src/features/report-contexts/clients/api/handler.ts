import type { RouteHandler } from '@hono/zod-openapi'
import { count, like, or } from 'drizzle-orm'
import { MAX_LIMIT } from '~/constants'
import { ERROR_STATUS } from '~/constants/error-message'
import { clients } from '~/db/schema'
import type { getClientsRoute } from '~/features/report-contexts/clients/api/route'
import { db } from '~/index'

export async function getClientsHandler(c: Parameters<RouteHandler<typeof getClientsRoute>>[0]) {
  const { skip, limit, names } = c.req.valid('query')

  const skipNumber = Number(skip) || 0
  const limitNumber = Number(limit) || MAX_LIMIT

  const namesArray = names ? names.split(',').map((name) => name.trim()) : []

  try {
    const whereClause =
      namesArray.length > 0
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

    return c.json(
      {
        clients: formattedClients,
        total: total[0].count,
        skip: skipNumber,
        limit: limitNumber,
      },
      200,
    )
  } catch (_) {
    return c.json(
      {
        error: ERROR_STATUS.SOMETHING_WENT_WRONG,
      },
      500,
    )
  }
}
