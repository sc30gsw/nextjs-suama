export const DAILY_REPORT_TABS_MAP = {
  DATE: { id: 'date', name: '日付' },
  PROJECT: { id: 'project', name: 'プロジェクト' },
} as const satisfies Record<string, Record<string, string>>

export const DAILY_REPORT_TABS: readonly (typeof DAILY_REPORT_TABS_MAP)[keyof typeof DAILY_REPORT_TABS_MAP][] =
  Object.values(DAILY_REPORT_TABS_MAP)
