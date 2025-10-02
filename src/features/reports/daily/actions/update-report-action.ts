'use server'

import { parseWithZod } from '@conform-to/zod'
import { format } from 'date-fns'
import { and, eq, inArray, not } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  GET_DAILY_REPORT_BY_ID_CACHE_KEY,
  GET_DAILY_REPORTS_FOR_MINE_CACHE_KEY,
  GET_DAILY_REPORTS_FOR_TODAY_CACHE_KEY,
  GET_UNRESOLVED_TROUBLES_CACHE_KEY,
} from '~/constants/cache-keys'
import { ERROR_STATUS } from '~/constants/error-message'
import { appeals, dailyReportMissions, dailyReports, missions, troubles } from '~/db/schema'
import { updateDailyReportFormSchema } from '~/features/reports/daily/types/schemas/edit-daily-report-form-schema'
import { db } from '~/index'
import { getServerSession } from '~/lib/get-server-session'
import { convertJstDateToUtc } from '~/utils/date-utils'

export async function updateReportAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: updateDailyReportFormSchema,
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

  const reportId = submission.value.reportId
  const actionType = formData.get('action')

  const reportDateString = submission.value.reportDate
  // 日付範囲検索用：指定日のJST開始時刻をUTCで取得
  const reportDate = convertJstDateToUtc(reportDateString, 'start')

  const report = await db.query.dailyReports.findFirst({
    where: eq(dailyReports.id, reportId),
  })

  if (!report) {
    return submission.reply({
      fieldErrors: { message: [ERROR_STATUS.NOT_FOUND] },
    })
  }

  if (report.userId !== session.user.id) {
    return submission.reply({
      fieldErrors: { message: [ERROR_STATUS.FOR_BIDDEN] },
    })
  }

  try {
    await db.transaction(async (tx) => {
      // 日報の基本情報を更新
      await tx
        .update(dailyReports)
        .set({
          reportDate,
          impression: submission.value.impression ?? null,
          release: actionType === 'published',
          remote: submission.value.remote,
        })
        .where(eq(dailyReports.id, reportId))

      await tx.delete(dailyReportMissions).where(eq(dailyReportMissions.dailyReportId, reportId))

      // ミッション情報を再作成
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
          dailyReportId: reportId,
          missionId: entry.mission,
          workContent: entry.content,
          hours: entry.hours,
        })
      }

      // アピール情報の処理
      const validAppealEntries = submission.value.appealEntries.filter(
        (entry) => entry.content && entry.content.length > 0 && entry.categoryId,
      )

      // upsertで既存は更新、新規は追加
      for (const entry of validAppealEntries) {
        await tx
          .insert(appeals)
          .values({
            id: entry.id,
            userId: session.user.id,
            dailyReportId: reportId,
            categoryOfAppealId: entry.categoryId!,
            appeal: entry.content!,
          })
          .onConflictDoUpdate({
            target: appeals.id,
            set: {
              categoryOfAppealId: entry.categoryId!,
              appeal: entry.content!,
            },
          })
      }

      // 送信されなかったAppealsを削除
      if (validAppealEntries.length > 0) {
        const submittedAppealIds = validAppealEntries.map((e) => e.id)
        await tx
          .delete(appeals)
          .where(
            and(eq(appeals.dailyReportId, reportId), not(inArray(appeals.id, submittedAppealIds))),
          )
      } else {
        // 全て削除
        await tx.delete(appeals).where(eq(appeals.dailyReportId, reportId))
      }

      // トラブル情報の処理
      const validTroubleEntries = submission.value.troubleEntries.filter(
        (entry) => entry.content && entry.content.length > 0 && entry.categoryId,
      )

      // upsertで既存はresolved更新、新規は追加
      for (const entry of validTroubleEntries) {
        await tx
          .insert(troubles)
          .values({
            id: entry.id,
            userId: session.user.id,
            categoryOfTroubleId: entry.categoryId!,
            trouble: entry.content!,
            resolved: entry.resolved,
          })
          .onConflictDoUpdate({
            target: troubles.id,
            set: {
              resolved: entry.resolved,
            },
          })
      }
    })

    revalidateTag(`${GET_DAILY_REPORTS_FOR_TODAY_CACHE_KEY}-${format(reportDate, 'yyyy-MM-dd')}`)
    revalidateTag(`${GET_DAILY_REPORTS_FOR_MINE_CACHE_KEY}-${session.user.id}`)
    revalidateTag(`${GET_DAILY_REPORT_BY_ID_CACHE_KEY}-${reportId}`)
    revalidateTag(`${GET_UNRESOLVED_TROUBLES_CACHE_KEY}-${session.user.id}`)
  } catch (error) {
    console.error('Update report error:', error)

    return submission.reply({
      fieldErrors: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
    })
  }

  redirect('/daily/mine')
}
