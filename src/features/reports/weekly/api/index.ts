import { Elysia, t } from 'elysia'
import { WeeklyReportService } from '~/features/reports/weekly/api/service'
import { WeeklyReportModel } from '~/features/reports/weekly/api/model'
import { sessionMiddleware } from '~/lib/session-middleware'
import {
  WeeklyReportServiceError,
  WeeklyReportNotFoundError,
} from '~/features/reports/weekly/api/errors'

export const weeklyReportPlugin = new Elysia({ prefix: '/weeklies', name: 'weeklyReport' })
  .use(sessionMiddleware)
  .error({
    WeeklyReportServiceError,
    WeeklyReportNotFoundError,
  })
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'WeeklyReportServiceError':
        set.status = error.status || 500

        return {
          error: error.message,
          code: 'WEEKLY_REPORT_SERVICE_ERROR',
        }

      case 'WeeklyReportNotFoundError':
        set.status = error.status || 404

        return {
          error: error.message,
          code: 'WEEKLY_REPORT_NOT_FOUND',
        }

      default:
        throw error
    }
  })
  .get(
    '/',
    async ({ query }) => {
      const result = await WeeklyReportService.getWeeklyReports({
        year: query.year ?? '2025',
        week: query.week ?? '1',
        offset: query.offset,
      })

      return result
    },
    {
      query: t.Optional(WeeklyReportModel.getWeeklyReportsQuery),
      response: {
        200: WeeklyReportModel.getWeeklyReportsResponse,
        401: WeeklyReportModel.errorResponse,
        500: WeeklyReportModel.errorResponse,
      },
      detail: {
        tags: ['Weekly Reports'],
        summary: '週報一覧取得',
        description:
          '指定された年・週の全ユーザーの週報を取得します。前週の予定、今週の日報、次週の予定、未解決のトラブルを含みます。',
      },
    },
  )
  .get(
    '/:weeklyReportId',
    async ({ params }) => {
      const result = await WeeklyReportService.getWeeklyReportById({
        weeklyReportId: params.weeklyReportId,
      })

      return result
    },
    {
      params: WeeklyReportModel.getWeeklyReportByIdParams,
      response: {
        200: WeeklyReportModel.getWeeklyReportByIdResponse,
        401: WeeklyReportModel.errorResponse,
        404: WeeklyReportModel.errorResponse,
        500: WeeklyReportModel.errorResponse,
      },
      detail: {
        tags: ['Weekly Reports'],
        summary: '週報詳細取得',
        description: '指定されたIDの週報の詳細情報を取得します。',
      },
    },
  )
  .get(
    '/current-user/:year/:week',
    async ({ params, user }) => {
      const result = await WeeklyReportService.getCurrentUserWeeklyReport(
        {
          year: params.year,
          week: params.week,
        },
        user.id,
      )

      return result
    },
    {
      params: WeeklyReportModel.getCurrentUserWeeklyReportParams,
      response: {
        200: WeeklyReportModel.getCurrentUserWeeklyReportResponse,
        401: WeeklyReportModel.errorResponse,
        404: WeeklyReportModel.errorResponse,
        500: WeeklyReportModel.errorResponse,
      },
      detail: {
        tags: ['Weekly Reports'],
        summary: '現在のユーザーの週報取得',
        description: 'ログイン中のユーザーの指定された年・週の週報を取得します。',
      },
    },
  )
  .get(
    '/last-week/:year/:week',
    async ({ params, user }) => {
      const result = await WeeklyReportService.getLastWeekReport(
        {
          year: params.year,
          week: params.week,
        },
        user.id,
      )

      return result
    },
    {
      params: WeeklyReportModel.getLastWeekReportParams,
      response: {
        200: WeeklyReportModel.getLastWeekReportResponse,
        401: WeeklyReportModel.errorResponse,
        404: WeeklyReportModel.errorResponse,
        500: WeeklyReportModel.errorResponse,
      },
      detail: {
        tags: ['Weekly Reports'],
        summary: '前週の週報取得',
        description:
          'ログイン中のユーザーの前週（指定週-1）の週報を取得します。ミッション情報を含みます。',
      },
    },
  )
