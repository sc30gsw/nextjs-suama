import { Elysia, t } from 'elysia'
import { AppealService } from '~/features/report-contexts/appeals/api/service'
import { AppealModel } from '~/features/report-contexts/appeals/api/model'
import { sessionMiddleware } from '~/lib/session-middleware'
import {
  AppealServiceError,
  AppealNotFoundError,
} from '~/features/report-contexts/appeals/api/errors'

export const appealPlugin = new Elysia({ prefix: '/appeals', name: 'appeal' })
  .use(sessionMiddleware)
  .error({
    AppealServiceError,
    AppealNotFoundError,
  })
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'AppealServiceError':
        set.status = error.status || 500

        return {
          error: error.message,
          code: 'APPEAL_SERVICE_ERROR',
        }

      case 'AppealNotFoundError':
        set.status = error.status || 404

        return {
          error: error.message,
          code: 'APPEAL_NOT_FOUND',
        }

      default:
        throw error
    }
  })
  .get(
    '/categories',
    async ({ query }) => {
      const result = await AppealService.getAppealCategories({
        skip: query.skip,
        limit: query.limit,
        names: query.names,
        withData: query.withData,
        reportId: query.reportId,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      })

      return result
    },
    {
      query: t.Optional(AppealModel.getAppealCategoriesQuery),
      response: {
        200: AppealModel.getAppealCategoriesResponse,
        401: AppealModel.errorResponse,
        500: AppealModel.errorResponse,
      },
      detail: {
        tags: ['Appeals'],
        summary: 'アピールカテゴリー一覧取得',
        description:
          'システムに登録されているアピールカテゴリーの一覧を取得します。ページネーションと名前フィルタリングに対応しています。',
      },
    },
  )
