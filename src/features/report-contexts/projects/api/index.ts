import { Elysia, t } from 'elysia'
import { ProjectService } from '~/features/report-contexts/projects/api/service'
import { ProjectModel } from '~/features/report-contexts/projects/api/model'
import { sessionMiddleware } from '~/lib/session-middleware'
import {
  ProjectServiceError,
  ProjectNotFoundError,
} from '~/features/report-contexts/projects/api/errors'

export const projectPlugin = new Elysia({ prefix: '/projects', name: 'project' })
  .use(sessionMiddleware)
  .error({
    ProjectServiceError,
    ProjectNotFoundError,
  })
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'ProjectServiceError':
        set.status = error.status || 500

        return {
          error: error.message,
          code: 'PROJECT_SERVICE_ERROR',
        }

      case 'ProjectNotFoundError':
        set.status = error.status || 404

        return {
          error: error.message,
          code: 'PROJECT_NOT_FOUND',
        }

      default:
        throw error
    }
  })
  .get(
    '/',
    async ({ query }) => {
      const result = await ProjectService.getProjects({
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
      query: t.Optional(ProjectModel.getProjectsQuery),
      response: {
        200: ProjectModel.getProjectsResponse,
        401: ProjectModel.errorResponse,
        500: ProjectModel.errorResponse,
      },
      detail: {
        tags: ['Projects'],
        summary: 'プロジェクト一覧取得',
        description:
          'システムに登録されているプロジェクトの一覧を取得します。ページネーションと名前フィルタリングに対応しています。',
      },
    },
  )
