export const DAILY_REPORT_BASE_PATH = '/daily'

// ? /todayでは使用しないため、mineとeveryのみ定義
export const DAILY_REPORT_KIND = {
  MINE: 'mine',
  EVERYONE: 'every',
} as const satisfies Record<string, string>
