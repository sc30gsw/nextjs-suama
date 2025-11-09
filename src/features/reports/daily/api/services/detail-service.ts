import type { Session } from 'better-auth'
import { and, eq } from 'drizzle-orm'
import { dailyReports, troubles } from '~/db/schema'
import { db } from '~/index'
import { dateUtils } from '~/utils/date-utils'
import { DailyReportServiceError } from './list-service'

export class DailyReportDetailService {
  async getDailyReportDetail(params: { id: string; userId?: string }, userId: Session['userId']) {
    const reportId = params.id
    const queryUserId = params.userId

    try {
      const targetUserId = queryUserId ?? userId

      const dailyReportDetailQuery = db.query.dailyReports.findFirst({
        where: and(eq(dailyReports.id, reportId), eq(dailyReports.userId, targetUserId)),
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
        where: and(eq(troubles.userId, targetUserId), eq(troubles.resolved, false)),
        with: {
          categoryOfTrouble: true,
        },
      })

      const [dailyReportDetail, unresolvedTroubles] = await Promise.all([
        dailyReportDetailQuery,
        unresolvedTroublesQuery,
      ])

      if (!dailyReportDetail) {
        return null
      }

      return {
        id: dailyReportDetail.id,
        reportDate: dailyReportDetail.reportDate
          ? dateUtils.formatDateByJST(dailyReportDetail.reportDate ?? new Date())
          : '',
        remote: dailyReportDetail.remote,
        impression: dailyReportDetail.impression ?? '',
        reportEntries: dailyReportDetail.dailyReportMissions.map((dailyReportMission) => ({
          id: dailyReportMission.id,
          project: dailyReportMission.mission.project.name,
          mission: dailyReportMission.mission.name,
          projectId: dailyReportMission.mission.project.id,
          missionId: dailyReportMission.mission.id,
          content: dailyReportMission.workContent,
          hours: dailyReportMission.hours ?? 0,
        })),
        appealEntries: dailyReportDetail.appeals.map((appeal) => ({
          id: appeal.id,
          categoryId: appeal.categoryOfAppealId,
          content: appeal.appeal,
        })),
        troubleEntries: unresolvedTroubles.map((trouble) => ({
          id: trouble.id,
          categoryId: trouble.categoryOfTroubleId,
          content: trouble.trouble,
        })),
      }
    } catch (error) {
      throw new DailyReportServiceError(
        `Failed to get daily report detail: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
