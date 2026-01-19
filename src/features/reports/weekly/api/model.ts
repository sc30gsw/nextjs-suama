import { t } from 'elysia'

export namespace WeeklyReportModel {
  export const getWeeklyReportsQuery = t.Object({
    year: t.String(),
    week: t.String(),
    offset: t.Optional(t.String()),
  })

  export type getWeeklyReportsQuery = typeof getWeeklyReportsQuery.static

  export const getWeeklyReportByIdParams = t.Object({
    weeklyReportId: t.String(),
  })

  export type getWeeklyReportByIdParams = typeof getWeeklyReportByIdParams.static

  export const getCurrentUserWeeklyReportParams = t.Object({
    year: t.String(),
    week: t.String(),
  })

  export type getCurrentUserWeeklyReportParams = typeof getCurrentUserWeeklyReportParams.static

  export const getLastWeekReportParams = t.Object({
    year: t.String(),
    week: t.String(),
  })

  export type getLastWeekReportParams = typeof getLastWeekReportParams.static

  export const mission = t.Object({
    id: t.String(),
    name: t.String(),
    likeKeywords: t.String(),
    projectId: t.String(),
    createdAt: t.String(),
    updatedAt: t.Nullable(t.String()),
    project: t.Object({
      id: t.String(),
      name: t.String(),
      likeKeywords: t.String(),
      isArchived: t.Boolean(),
      clientId: t.String(),
      createdAt: t.String(),
      updatedAt: t.Nullable(t.String()),
    }),
  })

  export type mission = typeof mission.static

  export const categoryOfTrouble = t.Object({
    name: t.String(),
  })

  export type categoryOfTrouble = typeof categoryOfTrouble.static

  export const categoryOfAppeal = t.Object({
    name: t.String(),
  })

  export type categoryOfAppeal = typeof categoryOfAppeal.static

  export const dailyReportMission = t.Object({
    id: t.String(),
    workContent: t.String(),
    hours: t.Nullable(t.Number()),
    missionId: t.String(),
    dailyReportId: t.String(),
    createdAt: t.String(),
    updatedAt: t.Nullable(t.String()),
    mission: mission,
  })

  export type dailyReportMission = typeof dailyReportMission.static

  export const simpleWeeklyReportMission = t.Object({
    id: t.String(),
    hours: t.Number(),
    workContent: t.String(),
    weeklyReportId: t.String(),
    missionId: t.String(),
    createdAt: t.String(),
    updatedAt: t.Nullable(t.String()),
  })

  export type simpleWeeklyReportMission = typeof simpleWeeklyReportMission.static

  export const weeklyReportMission = t.Object({
    id: t.String(),
    hours: t.Number(),
    workContent: t.String(),
    weeklyReportId: t.String(),
    missionId: t.String(),
    createdAt: t.String(),
    updatedAt: t.Nullable(t.String()),
    mission: mission,
  })

  export type weeklyReportMission = typeof weeklyReportMission.static

  export const trouble = t.Object({
    id: t.String(),
    trouble: t.String(),
    resolved: t.Boolean(),
    userId: t.String(),
    categoryOfTroubleId: t.String(),
    createdAt: t.String(),
    updatedAt: t.Nullable(t.String()),
    categoryOfTrouble: categoryOfTrouble,
  })

  export type trouble = typeof trouble.static

  export const appeal = t.Object({
    id: t.String(),
    appeal: t.String(),
    userId: t.String(),
    categoryOfAppealId: t.String(),
    dailyReportId: t.String(),
    createdAt: t.String(),
    updatedAt: t.Nullable(t.String()),
    categoryOfAppeal: categoryOfAppeal,
  })

  export type appeal = typeof appeal.static

  export const dailyReport = t.Object({
    id: t.String(),
    reportDate: t.Nullable(t.String()),
    impression: t.Nullable(t.String()),
    userId: t.String(),
    release: t.Boolean(),
    remote: t.Boolean(),
    createdAt: t.String(),
    updatedAt: t.Nullable(t.String()),
    dailyReportMissions: t.Array(dailyReportMission),
    appeals: t.Array(appeal),
  })

  export type dailyReport = typeof dailyReport.static

  export const user = t.Object({
    id: t.String(),
    name: t.String(),
    email: t.String(),
    emailVerified: t.Boolean(),
    image: t.Nullable(t.String()),
    createdAt: t.String(),
    updatedAt: t.Nullable(t.String()),
  })

  export type user = typeof user.static

  export const simpleWeeklyReport = t.Object({
    id: t.String(),
    userId: t.String(),
    year: t.Number(),
    week: t.Number(),
    createdAt: t.String(),
    updatedAt: t.Nullable(t.String()),
    weeklyReportMissions: t.Array(simpleWeeklyReportMission),
  })

  export type simpleWeeklyReport = typeof simpleWeeklyReport.static

  export const weeklyReport = t.Object({
    id: t.String(),
    userId: t.String(),
    year: t.Number(),
    week: t.Number(),
    createdAt: t.String(),
    updatedAt: t.Nullable(t.String()),
    weeklyReportMissions: t.Array(weeklyReportMission),
  })

  export type weeklyReport = typeof weeklyReport.static

  export const weeklyReportData = t.Object({
    user: user,
    lastWeekReports: t.Array(weeklyReport),
    dailyReports: t.Array(dailyReport),
    nextWeekReports: t.Array(weeklyReport),
    troubles: t.Array(trouble),
  })

  export type weeklyReportData = typeof weeklyReportData.static

  export const getWeeklyReportsResponse = t.Object({
    reports: t.Array(weeklyReportData),
    startDate: t.String(),
    endDate: t.String(),
  })

  export type getWeeklyReportsResponse = typeof getWeeklyReportsResponse.static

  export const getWeeklyReportByIdResponse = t.Object({
    weeklyReport: t.Nullable(simpleWeeklyReport),
  })

  export type getWeeklyReportByIdResponse = typeof getWeeklyReportByIdResponse.static

  export const getCurrentUserWeeklyReportResponse = t.Object({
    weeklyReport: t.Nullable(simpleWeeklyReport),
  })

  export type getCurrentUserWeeklyReportResponse = typeof getCurrentUserWeeklyReportResponse.static

  export const getLastWeekReportResponse = t.Object({
    weeklyReport: t.Nullable(weeklyReport),
  })

  export type getLastWeekReportResponse = typeof getLastWeekReportResponse.static

  export const errorResponse = t.Object({
    error: t.String(),
    code: t.String(),
  })

  export type errorResponse = typeof errorResponse.static
}
