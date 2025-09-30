'use server'

import { parseWithZod } from '@conform-to/zod'
import { format } from 'date-fns'
import { and, eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  GET_DAILY_REPORTS_FOR_MINE_CACHE_KEY,
  GET_DAILY_REPORTS_FOR_TODAY_CACHE_KEY,
} from '~/constants/cache-keys'
import { ERROR_STATUS } from '~/constants/error-message'
import { appeals, dailyReportMissions, dailyReports, missions, troubles } from '~/db/schema'
import { createDailyReportFormSchema } from '~/features/reports/daily/types/schemas/create-daily-report-form-schema'
import { db } from '~/index'
import { getServerSession } from '~/lib/get-server-session'
import { convertJstDateToUtc } from '~/utils/date-utils'

export async function createReportAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: createDailyReportFormSchema,
  })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  const session = await getServerSession()

  if (!session) {
    return submission.reply({
      fieldErrors: { message: [ERROR_STATUS.UNAUTHORIZED] },
    })
  }

  const actionType = formData.get('action')

  const reportDateString = submission.value.reportDate
  // 日付範囲検索用：指定日のJST開始時刻をUTCで取得
  const reportDate = convertJstDateToUtc(reportDateString, 'start')

  const existingReport = await db.query.dailyReports.findFirst({
    where: and(eq(dailyReports.userId, session.user.id), eq(dailyReports.reportDate, reportDate)),
  })

  if (existingReport) {
    return submission.reply({
      fieldErrors: { message: [ERROR_STATUS.ALREADY_EXISTS] },
    })
  }

  try {
    await db.transaction(async (tx) => {
      // 日報の基本情報を作成
      const [newDailyReport] = await tx
        .insert(dailyReports)
        .values({
          userId: session.user.id,
          reportDate,
          impression: submission.value.impression || null,
          release: actionType === 'published',
          remote: submission.value.remote,
        })
        .returning({ id: dailyReports.id })

      // ミッション情報を作成
      for (const entry of submission.value.reportEntries) {
        // ミッションの存在確認
        const mission = await tx.query.missions.findFirst({
          where: eq(missions.id, entry.mission),
        })

        if (!mission) {
          return submission.reply({
            fieldErrors: { message: [ERROR_STATUS.INVALID_MISSION_RELATION] },
          })
        }

        await tx.insert(dailyReportMissions).values({
          dailyReportId: newDailyReport.id,
          missionId: entry.mission,
          workContent: entry.content,
          hours: entry.hours,
        })
      }

      // アピール情報を作成
      const validAppealEntries = submission.value.appealEntries.filter(
        (entry) => entry.content && entry.content.length > 0 && entry.categoryId,
      )

      for (const entry of validAppealEntries) {
        await tx.insert(appeals).values({
          userId: session.user.id,
          dailyReportId: newDailyReport.id,
          categoryOfAppealId: entry.categoryId!,
          appeal: entry.content!,
        })
      }

      // トラブル情報を作成
      const validTroubleEntries = submission.value.troubleEntries.filter(
        (entry) => entry.content && entry.content.length > 0 && entry.categoryId,
      )

      for (const entry of validTroubleEntries) {
        await tx.insert(troubles).values({
          userId: session.user.id,
          categoryOfTroubleId: entry.categoryId!,
          trouble: entry.content!,
          resolved: false,
        })
      }
    })

    revalidateTag(`${GET_DAILY_REPORTS_FOR_TODAY_CACHE_KEY}-${format(reportDate, 'yyyy-MM-dd')}`)
    revalidateTag(`${GET_DAILY_REPORTS_FOR_MINE_CACHE_KEY}-${session.user.id}`)
  } catch (_) {
    return submission.reply({
      fieldErrors: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
    })
  }

  redirect('/daily')
}
