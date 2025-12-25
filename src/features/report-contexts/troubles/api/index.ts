import { Elysia, t } from 'elysia'
import { TroubleService } from '~/features/report-contexts/troubles/api/service'
import { TroubleModel } from '~/features/report-contexts/troubles/api/model'
import { sessionMiddleware } from '~/lib/session-middleware'
import {
  TroubleServiceError,
  TroubleNotFoundError,
} from '~/features/report-contexts/troubles/api/errors'

export const troublePlugin = new Elysia({ prefix: '/troubles', name: 'trouble' })
  .use(sessionMiddleware)
  .error({
    TroubleServiceError,
    TroubleNotFoundError,
  })
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'TroubleServiceError':
        set.status = error.status || 500

        return {
          error: error.message,
          code: 'TROUBLE_SERVICE_ERROR',
        }

      case 'TroubleNotFoundError':
        set.status = error.status || 404

        return {
          error: error.message,
          code: 'TROUBLE_NOT_FOUND',
        }

      default:
        throw error
    }
  })
  .get(
    '/categories',
    async ({ query, user }) => {
      const result = await TroubleService.getTroubleCategories(
        {
          skip: query.skip,
          limit: query.limit,
          names: query.names,
          withData: query.withData,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
        },
        user.id,
      )

      return result
    },
    {
      query: t.Optional(TroubleModel.getTroubleCategoriesQuery),
      response: {
        200: TroubleModel.getTroubleCategoriesResponse,
        401: TroubleModel.errorResponse,
        500: TroubleModel.errorResponse,
      },
      detail: {
        tags: ['Troubles'],
        summary: 'トラブルカテゴリー一覧取得',
        description:
          'システムに登録されているトラブルカテゴリーの一覧を取得します。ページネーションと名前フィルタリングに対応しています。',
      },
    },
  )
