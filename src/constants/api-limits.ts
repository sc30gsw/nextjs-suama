export const API_LIMITS = {
  MAX_RECORDS: 500,
  // TODO: リリース後のパフォーマンス・UX次第で調整を検討（現在: ユーザー30人/回）
  WEEKLY_REPORTS: 30,
} as const satisfies Record<string, number>
