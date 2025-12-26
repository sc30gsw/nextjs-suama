import { t } from 'elysia'

export namespace DailyReportModel {
  export const getDailyReportsQuery = t.Object({
    userId: t.Optional(t.String()),
    userNames: t.Optional(t.String()),
    skip: t.Optional(t.String()),
    limit: t.Optional(t.String()),
    startDate: t.Optional(t.String()),
    endDate: t.Optional(t.String()),
  })

  export type getDailyReportsQuery = typeof getDailyReportsQuery.static

  export const getDailyReportCountQuery = t.Object({
    userId: t.Optional(t.String()),
    userNames: t.Optional(t.String()),
    startDate: t.Optional(t.String()),
    endDate: t.Optional(t.String()),
  })

  export type getDailyReportCountQuery = typeof getDailyReportCountQuery.static

  export const getDailyReportSummaryQuery = t.Object({
    userId: t.Optional(t.String()),
    userNames: t.Optional(t.String()),
    skip: t.Optional(t.String()),
    limit: t.Optional(t.String()),
    startDate: t.Optional(t.String()),
    endDate: t.Optional(t.String()),
  })

  export type getDailyReportSummaryQuery = typeof getDailyReportSummaryQuery.static

  export const getDailyReportDatesQuery = t.Object({
    year: t.Optional(t.String()),
    month: t.Optional(t.String()),
    excludeReportId: t.Optional(t.String()),
  })

  export type getDailyReportDatesQuery = typeof getDailyReportDatesQuery.static

  export const getDailyReportDetailParams = t.Object({
    id: t.String(),
  })

  export type getDailyReportDetailParams = typeof getDailyReportDetailParams.static

  export const workContent = t.Object({
    id: t.String(),
    project: t.String(),
    mission: t.String(),
    workTime: t.Number(),
    workContent: t.String(),
  })

  export type workContent = typeof workContent.static

  export const todayReport = t.Object({
    id: t.String(),
    date: t.String(),
    username: t.String(),
    totalHour: t.Number(),
    impression: t.String(),
    isRemote: t.Boolean(),
    isTurnedIn: t.Boolean(),
    userId: t.String(),
    workContents: t.Array(workContent),
  })

  export type todayReport = typeof todayReport.static

  export const getDailyReportsResponse = t.Object({
    dailyReports: t.Array(todayReport),
    total: t.Number(),
    skip: t.Number(),
    limit: t.Number(),
    startDate: t.Optional(t.String()),
    endDate: t.Optional(t.String()),
    userId: t.Optional(t.String()),
  })

  export type getDailyReportsResponse = typeof getDailyReportsResponse.static

  export const getDailyReportCountResponse = t.Object({
    dailyReportsCount: t.Number(),
    projectsCount: t.Number(),
    totalHours: t.Number(),
  })

  export type getDailyReportCountResponse = typeof getDailyReportCountResponse.static

  export const projectSummary = t.Object({
    projectId: t.String(),
    projectName: t.String(),
    totalHours: t.Number(),
    workDays: t.Number(),
    firstWorkDate: t.Nullable(t.String()),
    lastWorkDate: t.Nullable(t.String()),
    averageHoursPerDay: t.Number(),
  })

  export type projectSummary = typeof projectSummary.static

  export const getDailyReportSummaryResponse = t.Object({
    summaries: t.Array(projectSummary),
  })

  export type getDailyReportSummaryResponse = typeof getDailyReportSummaryResponse.static

  export const reportEntry = t.Object({
    id: t.String(),
    project: t.String(),
    mission: t.String(),
    projectId: t.String(),
    missionId: t.String(),
    content: t.String(),
    hours: t.Number(),
  })

  export type reportEntry = typeof reportEntry.static

  export const appealEntry = t.Object({
    id: t.String(),
    categoryId: t.String(),
    content: t.String(),
  })

  export type appealEntry = typeof appealEntry.static

  export const troubleEntry = t.Object({
    id: t.String(),
    categoryId: t.String(),
    content: t.String(),
  })

  export type troubleEntry = typeof troubleEntry.static

  export const getDailyReportDetailResponse = t.Object({
    id: t.String(),
    reportDate: t.String(),
    remote: t.Boolean(),
    impression: t.String(),
    reportEntries: t.Array(reportEntry),
    appealEntries: t.Array(appealEntry),
    troubleEntries: t.Array(troubleEntry),
  })

  export type getDailyReportDetailResponse = typeof getDailyReportDetailResponse.static

  export const getDailyReportDatesResponse = t.Object({
    dates: t.Array(t.String()),
  })

  export type getDailyReportDatesResponse = typeof getDailyReportDatesResponse.static

  export const errorResponse = t.Object({
    error: t.String(),
    code: t.String(),
  })

  export type errorResponse = typeof errorResponse.static
}
