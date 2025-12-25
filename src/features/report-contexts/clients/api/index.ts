import { Elysia, t } from 'elysia'
import { ClientService } from '~/features/report-contexts/clients/api/service'
import { ClientModel } from '~/features/report-contexts/clients/api/model'
import { sessionMiddleware } from '~/lib/session-middleware'
import {
  ClientServiceError,
  ClientNotFoundError,
} from '~/features/report-contexts/clients/api/errors'

export const clientPlugin = new Elysia({ prefix: '/clients', name: 'client' })
  .use(sessionMiddleware)
  .error({
    ClientServiceError,
    ClientNotFoundError,
  })
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'ClientServiceError':
        set.status = error.status || 500

        return {
          error: error.message,
          code: 'CLIENT_SERVICE_ERROR',
        }

      case 'ClientNotFoundError':
        set.status = error.status || 404

        return {
          error: error.message,
          code: 'CLIENT_NOT_FOUND',
        }

      default:
        throw error
    }
  })
  .get(
    '/',
    async ({ query }) => {
      const result = await ClientService.getClients({
        skip: query.skip,
        limit: query.limit,
        names: query.names,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      })

      return result
    },
    {
      query: t.Optional(ClientModel.getClientsQuery),
      response: {
        200: ClientModel.getClientsResponse,
        401: ClientModel.errorResponse,
        500: ClientModel.errorResponse,
      },
      detail: {
        tags: ['Clients'],
        summary: 'クライアント一覧取得',
        description:
          'システムに登録されているクライアントの一覧を取得します。ページネーションと名前フィルタリングに対応しています。',
      },
    },
  )
