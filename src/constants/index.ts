export const MAX_ROWS_PER_PAGE = 100
export const MIN_ROWS_PER_PAGE = 10
export const MAX_LIMIT = 500

export const LIKE_KEYWORDS_REGEX = /^([\wぁ-んァ-ヶー一-龠]+)(\s*,\s*[\wぁ-んァ-ヶー一-龠]+)*$/

// ? FileTriggerコンポーネントのacceptedFileTypes Propsがreadonlyを受け付けないため readonly string[]とせず、string[]で定義
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const satisfies string[]
export const MAX_IMAGE_SIZE_MB = 5

// TODO: 開発時のloadMore検証時には1件などにして検証（50件とかでも問題ないが一旦30件とする）
export const WEEKLY_REPORTS_LIMIT = 30

export const RELOAD_DELAY = 1000

export const DAILY_REPORT_MINE_TABS = [
  { id: 'date', name: '日付' },
  { id: 'project', name: 'プロジェクト' },
] as const satisfies { id: string; name: string }[]
