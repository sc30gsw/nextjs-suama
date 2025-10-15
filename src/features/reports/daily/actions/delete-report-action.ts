'use server'

import type { SubmissionResult } from '@conform-to/react'
import { format } from 'date-fns'
import { eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import {
  GET_DAILY_REPORTS_FOR_MINE_CACHE_KEY,
  GET_DAILY_REPORTS_FOR_MINE_PROJECT_SUMMARY_CACHE_KEY,
  GET_DAILY_REPORTS_FOR_TODAY_CACHE_KEY,
} from '~/constants/cache-keys'
import { ERROR_STATUS } from '~/constants/error-message'
import { dailyReports } from '~/db/schema'
import { db } from '~/index'
import { getServerSession } from '~/lib/get-server-session'
import {
  type CommonDeleteIdSchema,
  commonDeleteIdSchema,
} from '~/types/schemas/common-delete-id-schema'
import { DATE_FORMAT } from '~/utils/date-utils'

export async function deleteReportAction(id: CommonDeleteIdSchema['id']) {
  const parseResult = commonDeleteIdSchema.safeParse({ id })

  if (!parseResult.success) {
    return {
      status: 'error',
      error: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
    } as const satisfies SubmissionResult
  }

  const session = await getServerSession()

  if (!session) {
    return {
      status: 'error',
      error: { message: [ERROR_STATUS.UNAUTHORIZED] },
    } as const satisfies SubmissionResult
  }

  // 既存の日報を確認
  const existingReport = await db.query.dailyReports.findFirst({
    where: eq(dailyReports.id, parseResult.data.id),
  })

  if (!existingReport) {
    return {
      status: 'error',
      error: { message: [ERROR_STATUS.NOT_FOUND] },
    } as const satisfies SubmissionResult
  }

  // 自分の日報か確認
  if (existingReport.userId !== session.user.id) {
    return {
      status: 'error',
      error: { message: [ERROR_STATUS.FOR_BIDDEN] },
    } as const satisfies SubmissionResult
  }

  try {
    // 日報を削除（関連するdailyReportMissionsは外部キー制約のcascadeで自動削除される）
    await db.delete(dailyReports).where(eq(dailyReports.id, parseResult.data.id))

    // キャッシュを再検証
    if (existingReport.reportDate) {
      revalidateTag(
        `${GET_DAILY_REPORTS_FOR_TODAY_CACHE_KEY}-${format(existingReport.reportDate, DATE_FORMAT)}`,
      )
    }

    revalidateTag(`${GET_DAILY_REPORTS_FOR_MINE_CACHE_KEY}-${session.user.id}`)
    revalidateTag(`${GET_DAILY_REPORTS_FOR_MINE_PROJECT_SUMMARY_CACHE_KEY}-${session.user.id}`)

    return {
      status: 'success',
    } as const satisfies SubmissionResult
  } catch (_) {
    return {
      status: 'error',
      error: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
    } as const satisfies SubmissionResult
  }
}
