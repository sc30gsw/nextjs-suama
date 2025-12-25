import { and, eq } from 'drizzle-orm'
import { dailyReports, troubles } from '~/db/schema'
import { db } from '~/index'
import { dateUtils } from '~/utils/date-utils'
import {
  DailyReportServiceError,
  DailyReportNotFoundError,
} from '~/features/reports/daily/api/errors'

export abstract class DailyReportDetailService {
  static async getDailyReportDetail(reportId: string, userId: string) {
    try {
      const dailyReportDetailQuery = db.query.dailyReports.findFirst({
        where: and(eq(dailyReports.id, reportId), eq(dailyReports.userId, userId)),
        with: {
          dailyReportMissions: {
            with: {
              mission: {
                with: {
                  project: true,
                },
              },
            },
          },
          appeals: {
            with: {
              categoryOfAppeal: true,
            },
          },
        },
      })

      const unresolvedTroublesQuery = db.query.troubles.findMany({
        where: and(eq(troubles.userId, userId), eq(troubles.resolved, false)),
        with: {
          categoryOfTrouble: true,
        },
      })

      const [dailyReportDetail, unresolvedTroubles] = await Promise.all([
        dailyReportDetailQuery,
        unresolvedTroublesQuery,
      ])

      if (!dailyReportDetail) {
        throw new DailyReportNotFoundError(reportId)
      }

      const reportDate = dailyReportDetail.reportDate
        ? dateUtils.formatDateByJST(dailyReportDetail.reportDate)
        : ''

      const reportEntries = dailyReportDetail.dailyReportMissions.map((dailyReportMission) => ({
        id: dailyReportMission.id,
        project: dailyReportMission.mission.project.name,
        mission: dailyReportMission.mission.name,
        projectId: dailyReportMission.mission.project.id,
        missionId: dailyReportMission.mission.id,
        content: dailyReportMission.workContent,
        hours: dailyReportMission.hours ?? 0,
      }))

      const appealEntries = dailyReportDetail.appeals.map((appeal) => ({
        id: appeal.id,
        categoryId: appeal.categoryOfAppealId,
        content: appeal.appeal,
      }))

      const troubleEntries = unresolvedTroubles.map((trouble) => ({
        id: trouble.id,
        categoryId: trouble.categoryOfTroubleId,
        content: trouble.trouble,
      }))

      return {
        id: dailyReportDetail.id,
        reportDate,
        remote: dailyReportDetail.remote,
        impression: dailyReportDetail.impression ?? '',
        reportEntries,
        appealEntries,
        troubleEntries,
      }
    } catch (error) {
      if (error instanceof DailyReportServiceError || error instanceof DailyReportNotFoundError) {
        throw error
      }
      throw new DailyReportServiceError(
        `Failed to get daily report detail: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
