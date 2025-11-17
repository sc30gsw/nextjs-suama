export const LIKE_KEYWORDS_REGEX = /^([\wぁ-んァ-ヶー一-龠]+)(\s*,\s*[\wぁ-んァ-ヶー一-龠]+)*$/

// ? FileTriggerコンポーネントのacceptedFileTypes Propsがreadonlyを受け付けないため readonly string[]とせず、string[]で定義
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const satisfies string[]
export const MAX_IMAGE_SIZE_MB = 5

export const RELOAD_DELAY = 1000

export const QUERY_DEFAULT_PARAMS = {
  SKIP: 0,
  LIMIT: 10,
} as const satisfies Record<string, number>

export const QUERY_MAX_LIMIT_VALUES = {
  GENERAL: 100,
  // TODO: リリース後のパフォーマンス・UX次第で調整を検討（現在: ユーザー30人/回）
  WEEKLY_REPORTS: 30,
} as const satisfies Record<string, number>
