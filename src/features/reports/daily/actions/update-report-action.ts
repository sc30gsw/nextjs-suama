'use server'

import { parseWithZod } from '@conform-to/zod/v4'
import { and, eq, inArray, not } from 'drizzle-orm'
import { updateTag } from 'next/cache'
import { filter, isDefined, map, pipe } from 'remeda'
import {
  GET_APPEAL_CATEGORIES_CACHE_KEY,
  GET_DAILY_PROJECT_SUMMARY_CACHE_KEY,
  GET_DAILY_REPORT_BY_ID_CACHE_KEY,
  GET_DAILY_REPORTS_CACHE_KEY,
  GET_DAILY_REPORTS_COUNT_CACHE_KEY,
  GET_TROUBLE_CATEGORIES_CACHE_KEY,
} from '~/constants/cache-keys'
import { ERROR_STATUS } from '~/constants/error-message'
import { appeals, dailyReportMissions, dailyReports, missions, troubles } from '~/db/schema'
import { updateDailyReportFormSchema } from '~/features/reports/daily/types/schemas/edit-daily-report-form-schema'
import { getDb } from '~/index'
import { getServerSession } from '~/lib/get-server-session'
import { dateUtils } from '~/utils/date-utils'

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

  const db = getDb()
  const reportId = submission.value.reportId
  const actionType = formData.get('action')

  const reportDateString = submission.value.reportDate
  const reportDate = dateUtils.convertJstDateToUtc(reportDateString, 'start')

  const existingReport = await db.query.dailyReports.findFirst({
    where: and(eq(dailyReports.userId, session.user.id), eq(dailyReports.reportDate, reportDate)),
  })

  if (existingReport && existingReport.id !== reportId) {
    return submission.reply({
      fieldErrors: { message: [ERROR_STATUS.ALREADY_EXISTS] },
    })
  }

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
      await tx
        .update(dailyReports)
        .set({
          reportDate,
          impression: submission.value.impression ?? null,
          release: actionType === 'published',
          remote: submission.value.remote,
        })
        .where(eq(dailyReports.id, reportId))

      const reportEntries = submission.value.reportEntries

      if (reportEntries.length > 0) {
        const submittedMissionIds = pipe(
          reportEntries,
          map((entry) => entry.mission),
          filter(isDefined),
        )

        //? [ミッションA, ミッションB, ミッションA]というようにミッションが重複する場合、[A, B]のように重複を省く
        const uniqueMissionIds = [...new Set(submittedMissionIds)]

        if (uniqueMissionIds.length > 0) {
          const existingMissions = await tx.query.missions.findMany({
            where: inArray(missions.id, uniqueMissionIds),
            columns: { id: true },
          })

          if (existingMissions.length !== uniqueMissionIds.length) {
            throw new Error(ERROR_STATUS.INVALID_MISSION_RELATION)
          }
        }

        // ?:現在のスキーマでは dailyReportMissions テーブルに (dailyReportId, missionId) の UNIQUE 制約がない。
        // ?:そのため、どのレコードをUPDATEすれば良いかを特定できず、onConflictDoUpdate を使ったUpsertができない。※UNIQUE 制約がある場合、午前と午後で同じミッションだけど内容を分けて書きたい場合、エラーになる。
        // ?:代わりに、トランザクション内で一度関連レコードを全て削除し、送信された内容で再作成することでデータの整合性を保つ。。
        await tx.delete(dailyReportMissions).where(eq(dailyReportMissions.dailyReportId, reportId))

        await tx.insert(dailyReportMissions).values(
          reportEntries.map((entry) => ({
            dailyReportId: reportId,
            missionId: entry.mission,
            workContent: entry.content,
            hours: entry.hours,
          })),
        )
      } else {
        await tx.delete(dailyReportMissions).where(eq(dailyReportMissions.dailyReportId, reportId))
      }

      const validAppealEntries = submission.value.appealEntries.filter(
        (entry) => entry.content && entry.content.length > 0 && entry.categoryId,
      )

      if (validAppealEntries.length > 0) {
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
      }

      if (validAppealEntries.length > 0) {
        const submittedAppealIds = validAppealEntries.map((e) => e.id)

        await tx
          .delete(appeals)
          .where(
            and(eq(appeals.dailyReportId, reportId), not(inArray(appeals.id, submittedAppealIds))),
          )
      } else {
        await tx.delete(appeals).where(eq(appeals.dailyReportId, reportId))
      }

      const validTroubleEntries = submission.value.troubleEntries.filter(
        (entry) => entry.content && entry.content.length > 0 && entry.categoryId,
      )

      if (validTroubleEntries.length > 0) {
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
      }
    })

    // TODO:本日の日報・自分の日報・みんなの日報の cache key の管理はまだ改善の余地がありそう。
    updateTag(`${GET_DAILY_REPORTS_CACHE_KEY}-${session.user.id}`)
    updateTag(`${GET_DAILY_REPORTS_CACHE_KEY}-every`)
    updateTag(`${GET_DAILY_PROJECT_SUMMARY_CACHE_KEY}-${session.user.id}`)
    updateTag(`${GET_DAILY_PROJECT_SUMMARY_CACHE_KEY}-every`)
    updateTag(`${GET_DAILY_REPORTS_COUNT_CACHE_KEY}-${session.user.id}`)
    updateTag(`${GET_DAILY_REPORTS_COUNT_CACHE_KEY}-every`)
    updateTag(`${GET_DAILY_REPORT_BY_ID_CACHE_KEY}-${reportId}`)
    updateTag(`${GET_TROUBLE_CATEGORIES_CACHE_KEY}-${session.user.id}`)
    updateTag(`${GET_APPEAL_CATEGORIES_CACHE_KEY}-${reportId}`)

    return {
      ...submission.reply(),
      data: {
        isDraft: actionType !== 'published',
      },
    }
  } catch (error) {
    if (error instanceof Error && error.message === ERROR_STATUS.INVALID_MISSION_RELATION) {
      return submission.reply({
        fieldErrors: { message: [ERROR_STATUS.INVALID_MISSION_RELATION] },
      })
    }

    console.error('Update report error:', error)

    return submission.reply({
      fieldErrors: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
    })
  }
}
