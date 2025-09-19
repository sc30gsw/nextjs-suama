'use server'

import type { SubmissionResult } from '@conform-to/react'
import { format } from 'date-fns'
import { and, eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import {
  GET_DAILY_REPORT_BY_ID_CACHE_KEY,
  GET_DAILY_REPORTS_FOR_MINE_CACHE_KEY,
  GET_DAILY_REPORTS_FOR_TODAY_CACHE_KEY,
} from '~/constants/cache-keys'
import { dailyReports } from '~/db/schema'
import { db } from '~/index'
import { getServerSession } from '~/lib/get-server-session'

export async function publishDraftAction(reportId: string) {
  const session = await getServerSession()

  if (!session) {
    return {
      status: 'error',
      error: { message: ['セッションが切れました。再度ログインしてください'] },
    } as const satisfies SubmissionResult
  }

  try {
    // 既存のレポートを確認（自分のものか確認）
    const existingReport = await db.query.dailyReports.findFirst({
      where: and(eq(dailyReports.id, reportId), eq(dailyReports.userId, session.user.id)),
    })

    if (!existingReport) {
      return {
        status: 'error',
        error: { message: ['日報が見つからないか、編集権限がありません'] },
      } as const satisfies SubmissionResult
    }

    if (!existingReport.reportDate) {
      return {
        status: 'error',
        error: { message: ['日報の日付が設定されていません'] },
      } as const satisfies SubmissionResult
    }

    if (existingReport.release) {
      return {
        status: 'error',
        error: { message: ['この日報は既に公開済みです'] },
      } as const satisfies SubmissionResult
    }

    // 下書きを公開状態に更新
    await db
      .update(dailyReports)
      .set({
        release: true,
      })
      .where(eq(dailyReports.id, reportId))

    revalidateTag(
      `${GET_DAILY_REPORTS_FOR_TODAY_CACHE_KEY}-${format(existingReport.reportDate, 'yyyy-MM-dd')}`,
    )
    revalidateTag(`${GET_DAILY_REPORTS_FOR_MINE_CACHE_KEY}-${session.user.id}`)
    revalidateTag(`${GET_DAILY_REPORT_BY_ID_CACHE_KEY}-${reportId}`)

    return {
      status: 'success',
    } as const satisfies SubmissionResult
  } catch (error) {
    console.error('Publish draft error:', error)
    return {
      status: 'error',
      error: { message: ['公開処理中にエラーが発生しました'] },
    } as const satisfies SubmissionResult
  }
}
