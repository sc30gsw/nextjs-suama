'use server'

import { parseWithZod } from '@conform-to/zod/v4'
import { eq, inArray } from 'drizzle-orm'
import { updateTag } from 'next/cache'
import { filter, map, pipe } from 'remeda'
import { GET_WEEKLY_REPORT_MISSIONS_BY_ID_CACHE_KEY } from '~/constants/cache-keys'
import { ERROR_STATUS } from '~/constants/error-message'
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
      fieldErrors: { message: [ERROR_STATUS.UNAUTHORIZED] },
    })
  }

  try {
    const weeklyReport = await db.query.weeklyReports.findFirst({
      where: eq(weeklyReports.id, submission.value.weeklyReportId),
    })

    if (!weeklyReport) {
      return submission.reply({
        fieldErrors: { message: [ERROR_STATUS.NOT_FOUND] },
      })
    }

    if (weeklyReport.userId !== session.user.id) {
      return submission.reply({
        fieldErrors: { message: [ERROR_STATUS.FOR_BIDDEN] },
      })
    }

    const weeklyReportMissionList = await db.query.weeklyReportMissions.findMany({
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
            message: [ERROR_STATUS.INVALID_PROJECT_RELATION],
          },
        })
      }

      const mission = await db.query.missions.findFirst({
        where: eq(missions.id, weeklyReportInput.mission),
      })

      if (!mission) {
        return submission.reply({
          fieldErrors: {
            message: [ERROR_STATUS.INVALID_MISSION_RELATION],
          },
        })
      }

      const isExisting = weeklyReportMissionList.find(
        (weeklyReportMission) => weeklyReportMission.id === weeklyReportInput.id,
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

    updateTag(`${GET_WEEKLY_REPORT_MISSIONS_BY_ID_CACHE_KEY}-${weeklyReport.id}`)

    return submission.reply()
  } catch {
    return submission.reply({
      fieldErrors: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
    })
  }
}
