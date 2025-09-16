'use server'

import { parseWithZod } from '@conform-to/zod'
import { and, eq } from 'drizzle-orm'
import { fromZonedTime } from 'date-fns-tz'
import { redirect } from 'next/navigation'
import { appeals, dailyReportMissions, dailyReports, missions, troubles } from '~/db/schema'
import { createDailyReportFormSchema } from '~/features/reports/daily/types/schemas/create-daily-report-form-schema'
import { db } from '~/index'
import { getServerSession } from '~/lib/get-server-session'

export async function updateReportAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: createDailyReportFormSchema,
  })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  const session = await getServerSession()

  if (!session) {
    return submission.reply({
      fieldErrors: { message: ['Unauthorized'] },
    })
  }

  const reportId = formData.get('reportId') as string
  if (!reportId) {
    return submission.reply({
      formErrors: ['Report ID is required'],
    })
  }

  const actionType = formData.get('action')

  const reportDateString = submission.value.reportDate
  // 日本時間として適切に処理
  const reportDate = fromZonedTime(`${reportDateString}T00:00:00`, 'Asia/Tokyo')

  // 既存のレポートを確認（自分のものか確認）
  const existingReport = await db.query.dailyReports.findFirst({
    where: and(eq(dailyReports.id, reportId), eq(dailyReports.userId, session.user.id)),
  })

  if (!existingReport) {
    return submission.reply({
      fieldErrors: { message: ['レポートが見つからないか、編集権限がありません'] },
    })
  }

  try {
    await db.transaction(async (tx) => {
      // 日報の基本情報を更新
      await tx
        .update(dailyReports)
        .set({
          reportDate,
          impression: submission.value.impression || null,
          release: actionType === 'published',
          remote: submission.value.remote,
          updatedAt: new Date(),
        })
        .where(eq(dailyReports.id, reportId))

      // 既存のミッション情報を削除
      await tx.delete(dailyReportMissions).where(eq(dailyReportMissions.dailyReportId, reportId))

      // ミッション情報を再作成
      for (const entry of submission.value.reportEntries) {
        // ミッションの存在確認
        const mission = await tx.query.missions.findFirst({
          where: eq(missions.id, entry.mission),
        })

        if (!mission) {
          return submission.reply({
            formErrors: [
              'ミッションが存在しません。再度、選択し直すか、ミッションの登録を行ってください。',
            ],
          })
        }

        await tx.insert(dailyReportMissions).values({
          dailyReportId: reportId,
          missionId: entry.mission,
          workContent: entry.content,
          hours: entry.hours,
        })
      }

      // 既存のアピール情報を削除
      await tx.delete(appeals).where(eq(appeals.dailyReportId, reportId))

      // アピール情報を再作成
      const validAppealEntries = submission.value.appealEntries.filter(
        (entry) => entry.content && entry.content.length > 0 && entry.categoryId,
      )

      for (const entry of validAppealEntries) {
        await tx.insert(appeals).values({
          userId: session.user.id,
          dailyReportId: reportId,
          categoryOfAppealId: entry.categoryId!,
          appeal: entry.content!,
        })
      }

      // 既存のトラブル情報を削除（このレポートに紐づくもの）
      await tx
        .delete(troubles)
        .where(and(eq(troubles.userId, session.user.id), eq(troubles.resolved, false)))

      // トラブル情報を再作成
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
  } catch (error) {
    console.error('Update report error:', error)
    return submission.reply({
      fieldErrors: { message: ['日報の更新に失敗しました'] },
    })
  }

  // 更新成功後のリダイレクト
  if (actionType === 'published') {
    redirect('/daily/mine')
  } else {
    redirect('/daily/mine')
  }
}