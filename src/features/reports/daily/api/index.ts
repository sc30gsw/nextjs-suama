import { Elysia, t } from 'elysia'
import { DailyReportListService } from '~/features/reports/daily/api/services/list-service'
import { DailyReportCountService } from '~/features/reports/daily/api/services/count-service'
import { DailyReportSummaryService } from '~/features/reports/daily/api/services/summary-service'
import { DailyReportDetailService } from '~/features/reports/daily/api/services/detail-service'
import { DailyReportDatesService } from '~/features/reports/daily/api/services/dates-service'
import { DailyReportModel } from '~/features/reports/daily/api/model'
import { sessionMiddleware } from '~/lib/session-middleware'
import {
  DailyReportServiceError,
  DailyReportNotFoundError,
} from '~/features/reports/daily/api/errors'

export const dailyReportPlugin = new Elysia({ prefix: '/dailies', name: 'dailyReport' })
  .use(sessionMiddleware)
  .error({
    DailyReportServiceError,
    DailyReportNotFoundError,
  })
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'DailyReportServiceError':
        set.status = error.status || 500

        return {
          error: error.message,
          code: 'DAILY_REPORT_SERVICE_ERROR',
        }

      case 'DailyReportNotFoundError':
        set.status = error.status || 404

        return {
          error: error.message,
          code: 'DAILY_REPORT_NOT_FOUND',
        }

      default:
        throw error
    }
  })
  .get(
    '/',
    async ({ query }) => {
      const result = await DailyReportListService.getDailyReportsList({
        userId: query.userId,
        userNames: query.userNames,
        skip: query.skip,
        limit: query.limit,
        startDate: query.startDate,
        endDate: query.endDate,
      })

      return result
    },
    {
      query: t.Optional(DailyReportModel.getDailyReportsQuery),
      response: {
        200: DailyReportModel.getDailyReportsResponse,
        401: DailyReportModel.errorResponse,
        500: DailyReportModel.errorResponse,
      },
      detail: {
        tags: ['Daily Reports'],
        summary: '日報一覧取得',
        description:
          '日報を日付範囲で取得します。userIdを指定した場合は特定のユーザーの日報、userNamesを指定した場合はユーザー名でフィルタリング、何も指定しない場合は全員の日報を返します。',
      },
    },
  )
  .get(
    '/count',
    async ({ query }) => {
      const result = await DailyReportCountService.getCount({
        userId: query.userId,
        userNames: query.userNames,
        startDate: query.startDate,
        endDate: query.endDate,
      })

      return result
    },
    {
      query: t.Optional(DailyReportModel.getDailyReportCountQuery),
      response: {
        200: DailyReportModel.getDailyReportCountResponse,
        401: DailyReportModel.errorResponse,
        500: DailyReportModel.errorResponse,
      },
      detail: {
        tags: ['Daily Reports'],
        summary: '日報集計データ取得',
        description:
          '日報数、プロジェクト数、合計時間の集計データを取得します。userIdまたはuserNamesを指定しない場合は全員の集計、指定した場合は特定のユーザーの集計を返します。',
      },
    },
  )
  .get(
    '/summary',
    async ({ query }) => {
      const result = await DailyReportSummaryService.getDailyReportSummary({
        userId: query.userId,
        userNames: query.userNames,
        skip: query.skip,
        limit: query.limit,
        startDate: query.startDate,
        endDate: query.endDate,
      })

      return result
    },
    {
      query: t.Optional(DailyReportModel.getDailyReportSummaryQuery),
      response: {
        200: DailyReportModel.getDailyReportSummaryResponse,
        401: DailyReportModel.errorResponse,
        500: DailyReportModel.errorResponse,
      },
      detail: {
        tags: ['Daily Reports'],
        summary: '日報プロジェクトサマリー取得',
        description:
          '日報のプロジェクトごとの作業統計サマリーを取得します。userIdを指定しない場合は全員のサマリー、指定した場合は特定のユーザーのサマリーを返します。',
      },
    },
  )
  .get(
    '/dates',
    async ({ query, user }) => {
      const result = await DailyReportDatesService.getDailyReportDates(user.id, {
        year: query.year,
        month: query.month,
        excludeReportId: query.excludeReportId,
      })

      return result
    },
    {
      query: t.Optional(DailyReportModel.getDailyReportDatesQuery),
      response: {
        200: DailyReportModel.getDailyReportDatesResponse,
        401: DailyReportModel.errorResponse,
        500: DailyReportModel.errorResponse,
      },
      detail: {
        tags: ['Daily Reports'],
        summary: '登録済み日報の日付取得',
        description:
          '指定された年月の認証済みユーザーの登録済み日報日付を取得します。DatePickerで重複登録を防ぐために使用します。',
      },
    },
  )
  .get(
    '/:id',
    async ({ params, user }) => {
      const result = await DailyReportDetailService.getDailyReportDetail(params.id, user.id)

      return result
    },
    {
      params: DailyReportModel.getDailyReportDetailParams,
      response: {
        200: DailyReportModel.getDailyReportDetailResponse,
        401: DailyReportModel.errorResponse,
        404: DailyReportModel.errorResponse,
        500: DailyReportModel.errorResponse,
      },
      detail: {
        tags: ['Daily Reports'],
        summary: '日報詳細取得',
        description: '指定されたIDの、認証済みユーザーの日報の詳細情報を取得します。',
      },
    },
  )
