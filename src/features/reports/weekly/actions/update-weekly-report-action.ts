'use server'

import { parseWithZod } from '@conform-to/zod'
import { eq, inArray } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { filter, map, pipe } from 'remeda'
import { GET_WEEKLY_REPORT_MISSIONS_BY_ID_CACHE_KEY } from '~/constants/cache-keys'
import { missions, weeklyReportMissions, weeklyReports } from '~/db/schema'
import { updateWeeklyReportFormSchema } from '~/features/reports/weekly/types/schemas/update-weekly-report-form-schema'
import { db } from '~/index'
import { getServerSession } from '~/lib/get-server-session'

export async function updateWeeklyReportAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: updateWeeklyReportFormSchema,
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
    const weeklyReport = await db.query.weeklyReports.findFirst({
      where: eq(weeklyReports.id, submission.value.weeklyReportId),
    })

    if (!weeklyReport) {
      return submission.reply({
        fieldErrors: { message: ['週報が存在しません'] },
      })
    }

    if (weeklyReport.userId !== session.user.id) {
      return submission.reply({
        fieldErrors: { message: ['他のユーザーの週報は更新できません。'] },
      })
    }

    const weeklyReportMissionList =
      await db.query.weeklyReportMissions.findMany({
        where: eq(weeklyReportMissions.weeklyReportId, weeklyReport.id),
      })

    const inputIds = pipe(
      submission.value.weeklyReports,
      map((item) => item.id),
      filter((id): id is string => !!id),
    )

    const deleteTargets = weeklyReportMissionList.filter(
      (mission) => !inputIds.includes(mission.id),
    )

    if (deleteTargets.length > 0) {
      await db.delete(weeklyReportMissions).where(
        inArray(
          weeklyReportMissions.id,
          deleteTargets.map((m) => m.id),
        ),
      )
    }

    for (const weeklyReportInput of submission.value.weeklyReports) {
      const project = await db.query.projects.findFirst({
        where: eq(missions.id, weeklyReportInput.project),
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
        where: eq(missions.id, weeklyReportInput.mission),
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

      const isExisting = weeklyReportMissionList.find(
        (weeklyReportMission) =>
          weeklyReportMission.id === weeklyReportInput.id,
      )

      if (isExisting) {
        await db
          .update(weeklyReportMissions)
          .set({
            missionId: weeklyReportInput.mission,
            hours: weeklyReportInput.hours,
            workContent: weeklyReportInput.content,
          })
          .where(eq(weeklyReportMissions.id, isExisting.id))
      } else {
        await db.insert(weeklyReportMissions).values({
          weeklyReportId: weeklyReport.id,
          missionId: weeklyReportInput.mission,
          hours: weeklyReportInput.hours,
          workContent: weeklyReportInput.content,
        })
      }
    }

    revalidateTag(
      `${GET_WEEKLY_REPORT_MISSIONS_BY_ID_CACHE_KEY}-${weeklyReport.id}`,
    )

    return submission.reply()
  } catch (_) {
    return submission.reply({
      fieldErrors: { message: ['Something went wrong'] },
    })
  }
}
