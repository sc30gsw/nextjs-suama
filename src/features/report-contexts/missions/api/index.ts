import { Elysia, t } from 'elysia'
import { MissionService } from '~/features/report-contexts/missions/api/service'
import { MissionModel } from '~/features/report-contexts/missions/api/model'
import { sessionMiddleware } from '~/lib/session-middleware'
import {
  MissionServiceError,
  MissionNotFoundError,
} from '~/features/report-contexts/missions/api/errors'

export const missionPlugin = new Elysia({ prefix: '/missions', name: 'mission' })
  .use(sessionMiddleware)
  .error({
    MissionServiceError,
    MissionNotFoundError,
  })
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'MissionServiceError':
        set.status = error.status || 500

        return {
          error: error.message,
          code: 'MISSION_SERVICE_ERROR',
        }

      case 'MissionNotFoundError':
        set.status = error.status || 404

        return {
          error: error.message,
          code: 'MISSION_NOT_FOUND',
        }

      default:
        throw error
    }
  })
  .get(
    '/',
    async ({ query }) => {
      const result = await MissionService.getMissions({
        skip: query.skip,
        limit: query.limit,
        names: query.names,
        archiveStatus: query.archiveStatus,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      })

      return result
    },
    {
      query: t.Optional(MissionModel.getMissionsQuery),
      response: {
        200: MissionModel.getMissionsResponse,
        401: MissionModel.errorResponse,
        500: MissionModel.errorResponse,
      },
      detail: {
        tags: ['Missions'],
        summary: 'ミッション一覧取得',
        description:
          'システムに登録されているミッションの一覧を取得します。ページネーションと名前フィルタリングに対応しています。',
      },
    },
  )
