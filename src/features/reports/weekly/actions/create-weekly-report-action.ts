'use server'

import { parseWithZod } from '@conform-to/zod'
import { eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { GET_WEEKLY_REPORTS_CACHE_KEY } from '~/constants/cache-keys'
import { missions, weeklyReportMissions, weeklyReports } from '~/db/schema'
import { createWeeklyReportFormSchema } from '~/features/reports/weekly/types/schemas/create-weekly-report-form-schema'
import { db } from '~/index'
import { getServerSession } from '~/lib/get-server-session'

export async function createWeeklyReportAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: createWeeklyReportFormSchema,
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

  try {
    const [newWeeklyReport] = await db
      .insert(weeklyReports)
      .values({
        userId: session.user.id,
        year: submission.value.year,
        week: submission.value.week,
      })
      .returning({ id: weeklyReports.id })

    for (const weeklyReport of submission.value.weeklyReports) {
      const project = await db.query.projects.findFirst({
        where: eq(missions.id, weeklyReport.project),
      })
      if (!project) {
        return submission.reply({
          fieldErrors: {
            message: [
              'プロジェクトが存在しません。再度、選択し直すか、プロジェクトの登録を行ってください。',
            ],
          },
        })
      }

      const mission = await db.query.missions.findFirst({
        where: eq(missions.id, weeklyReport.mission),
      })

      if (!mission) {
        return submission.reply({
          fieldErrors: {
            message: [
              'ミッションが存在しません。再度、選択し直すか、ミッションの登録を行ってください。',
            ],
          },
        })
      }

      await db.insert(weeklyReportMissions).values({
        weeklyReportId: newWeeklyReport.id,
        missionId: weeklyReport.mission,
        hours: weeklyReport.hours,
        workContent: weeklyReport.content,
      })
    }

    revalidateTag(GET_WEEKLY_REPORTS_CACHE_KEY)

    return submission.reply()
  } catch (_) {
    return submission.reply({
      fieldErrors: { message: ['Something went wrong'] },
    })
  }
}
