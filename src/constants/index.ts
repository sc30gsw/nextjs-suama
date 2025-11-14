export const LIKE_KEYWORDS_REGEX = /^([\wぁ-んァ-ヶー一-龠]+)(\s*,\s*[\wぁ-んァ-ヶー一-龠]+)*$/

// ? FileTriggerコンポーネントのacceptedFileTypes Propsがreadonlyを受け付けないため readonly string[]とせず、string[]で定義
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const satisfies string[]
export const MAX_IMAGE_SIZE_MB = 5

export const RELOAD_DELAY = 1000
