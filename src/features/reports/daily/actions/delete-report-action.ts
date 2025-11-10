'use server'

import type { SubmissionResult } from '@conform-to/react'
import { eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import {
  GET_DAILY_PROJECT_SUMMARY_CACHE_KEY,
  GET_DAILY_REPORT_BY_ID_CACHE_KEY,
  GET_DAILY_REPORTS_CACHE_KEY,
  GET_DAILY_REPORTS_COUNT_CACHE_KEY,
} from '~/constants/cache-keys'
import { ERROR_STATUS } from '~/constants/error-message'
import { dailyReports } from '~/db/schema'
import { db } from '~/index'
import { getServerSession } from '~/lib/get-server-session'
import {
  type CommonDeleteIdSchema,
  commonDeleteIdSchema,
} from '~/types/schemas/common-delete-id-schema'

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

  const existingReport = await db.query.dailyReports.findFirst({
    where: eq(dailyReports.id, parseResult.data.id),
  })

  if (!existingReport) {
    return {
      status: 'error',
      error: { message: [ERROR_STATUS.NOT_FOUND] },
    } as const satisfies SubmissionResult
  }

  if (existingReport.userId !== session.user.id) {
    return {
      status: 'error',
      error: { message: [ERROR_STATUS.FOR_BIDDEN] },
    } as const satisfies SubmissionResult
  }

  try {
    await db.delete(dailyReports).where(eq(dailyReports.id, parseResult.data.id))

    // TODO:本日の日報・自分の日報・みんなの日報の cache key の管理はまだ改善の余地あり
    revalidateTag(`${GET_DAILY_REPORTS_CACHE_KEY}-${session.user.id}`)
    revalidateTag(`${GET_DAILY_REPORTS_CACHE_KEY}-every`)
    revalidateTag(`${GET_DAILY_PROJECT_SUMMARY_CACHE_KEY}-${session.user.id}`)
    revalidateTag(`${GET_DAILY_PROJECT_SUMMARY_CACHE_KEY}-every`)
    revalidateTag(`${GET_DAILY_REPORTS_COUNT_CACHE_KEY}-${session.user.id}`)
    revalidateTag(`${GET_DAILY_REPORTS_COUNT_CACHE_KEY}-every`)
    revalidateTag(`${GET_DAILY_REPORT_BY_ID_CACHE_KEY}-${parseResult.data.id}`)

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
