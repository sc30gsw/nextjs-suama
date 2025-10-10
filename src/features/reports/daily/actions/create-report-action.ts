'use server'

import { parseWithZod } from '@conform-to/zod/v4'
import { format } from 'date-fns'
import { and, eq, inArray } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { filter, isDefined, map, pipe } from 'remeda'
import {
  GET_DAILY_REPORTS_FOR_MINE_CACHE_KEY,
  GET_DAILY_REPORTS_FOR_TODAY_CACHE_KEY,
  GET_TROUBLE_CATEGORIES_CACHE_KEY,
} from '~/constants/cache-keys'
import { ERROR_STATUS } from '~/constants/error-message'
import { appeals, dailyReportMissions, dailyReports, missions, troubles } from '~/db/schema'
import { createDailyReportFormSchema } from '~/features/reports/daily/types/schemas/create-daily-report-form-schema'
import { db } from '~/index'
import { getServerSession } from '~/lib/get-server-session'
import { DATE_FORMAT, dateUtils } from '~/utils/date-utils'

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
  const reportDate = dateUtils.convertJstDateToUtc(reportDateString, 'start')

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
          impression: submission.value.impression ?? null,
          release: actionType === 'published',
          remote: submission.value.remote,
        })
        .returning({ id: dailyReports.id })

      // ミッション情報を作成
      const reportEntries = submission.value.reportEntries
      if (reportEntries.length > 0) {
        const submittedMissionIds = pipe(
          reportEntries,
          map((entry) => entry.mission),
          filter(isDefined),
        )

        // [ミッションA, ミッションB, ミッションA]というようにミッションが重複する場合、[A, B]のように重複を省く
        const uniqueMissionIds = [...new Set(submittedMissionIds)]

        if (uniqueMissionIds.length > 0) {
          const existingMissions = await tx.query.missions.findMany({
            where: inArray(missions.id, uniqueMissionIds),
            columns: { id: true },
          })

          if (existingMissions.length !== uniqueMissionIds.length) {
            // 1つでも存在しないmissionIdがあればエラーをスローしてロールバック
            throw new Error(ERROR_STATUS.INVALID_MISSION_RELATION)
          }
        }

        await tx.insert(dailyReportMissions).values(
          reportEntries.map((entry) => ({
            dailyReportId: newDailyReport.id,
            missionId: entry.mission,
            workContent: entry.content,
            hours: entry.hours,
          })),
        )
      }

      // アピール情報を作成
      const validAppealEntries = submission.value.appealEntries.filter(
        (entry) => entry.content && entry.content.length > 0 && entry.categoryId,
      )

      if (validAppealEntries.length > 0) {
        await tx.insert(appeals).values(
          validAppealEntries.map((entry) => ({
            userId: session.user.id,
            dailyReportId: newDailyReport.id,
            categoryOfAppealId: entry.categoryId!,
            appeal: entry.content!,
          })),
        )
      }

      // トラブル情報を作成
      const validTroubleEntries = submission.value.troubleEntries.filter(
        (entry) => entry.content && entry.content.length > 0 && entry.categoryId,
      )

      // upsertで既存はresolved更新、新規は追加
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

    revalidateTag(`${GET_DAILY_REPORTS_FOR_TODAY_CACHE_KEY}-${format(reportDate, DATE_FORMAT)}`)
    revalidateTag(`${GET_DAILY_REPORTS_FOR_MINE_CACHE_KEY}-${session.user.id}`)
    revalidateTag(`${GET_TROUBLE_CATEGORIES_CACHE_KEY}-${session.user.id}`)

    return {
      ...submission.reply(),
      data: {
        reportDate: dateUtils.formatDateByJST(reportDate, 'yyyy/MM/dd'),
        isDraft: actionType !== 'published',
      },
    }
  } catch (err) {
    if (err instanceof Error && err.message === ERROR_STATUS.INVALID_MISSION_RELATION) {
      return submission.reply({
        fieldErrors: { message: [ERROR_STATUS.INVALID_MISSION_RELATION] },
      })
    }

    return submission.reply({
      fieldErrors: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
    })
  }
}
