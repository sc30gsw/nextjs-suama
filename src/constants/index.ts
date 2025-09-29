export const MAX_ROWS_PER_PAGE = 100
export const MIN_ROWS_PER_PAGE = 10
export const MAX_LIMIT = 500

export const LIKE_KEYWORDS_REGEX = /^([\wぁ-んァ-ヶー一-龠]+)(\s*,\s*[\wぁ-んァ-ヶー一-龠]+)*$/

// ? FileTriggerコンポーネントのacceptedFileTypes Propsがreadonlyを受け付けないため readonly string[]とせず、string[]で定義
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const satisfies string[]
export const MAX_IMAGE_SIZE_MB = 5

// TODO: 開発時のloadMore検証時には1件などにして検証（50件とかでも問題ないが一旦30件とする）
export const WEEKLY_REPORTS_LIMIT = 30

export const ERROR_STATUS = {
  UNAUTHORIZED: 'Unauthorized',
  NOT_FOUND: 'NotFound',
  FOR_BIDDEN: 'Forbidden',
} as const satisfies Record<string, string>

export type ErrorStatus = (typeof ERROR_STATUS)[keyof typeof ERROR_STATUS]

export const TOAST_MESSAGES = {
  // --- Auth ---
  SIGN_IN_SUCCESS: 'サインインしました',
  SIGN_IN_FAILED: 'サインインに失敗しました',
  SIGN_UP_SUCCESS: 'サインアップしました',
  SIGN_UP_FAILED: 'サインアップに失敗しました',
  SIGN_OUT_SUCCESS: 'ログアウトしました',
  SIGN_OUT_FAILED: 'ログアウトに失敗しました',
  UNAUTHORIZED: 'セッションが切れました。再度ログインしてください',

  // --- Password ---
  PASSWORD_RESET_SUCCESS: 'パスワードリセットに成功しました',
  PASSWORD_RESET_FAILED: 'パスワードリセットに失敗しました',
  PASSWORD_RESET_REDIRECT: 'パスワードリセット画面にリダイレクトします',
  PASSWORD_RESET_REDIRECT_FAILED: 'パスワードリセット画面にリダイレクトできませんでした',
  PASSWORD_CHANGE_SUCCESS: 'パスワードの変更に成功しました',
  PASSWORD_CHANGE_FAILED: 'パスワードの変更に失敗しました',

  // --- User ---
  USER_UPDATE_SUCCESS: 'ユーザーの更新に成功しました',
  USER_UPDATE_FAILED: 'ユーザーの更新に失敗しました',
  USER_DELETE_SUCCESS: 'ユーザーの削除に成功しました',
  USER_DELETE_FAILED: 'ユーザーの削除に失敗しました',
  PASSKEY_ADD_SUCCESS: 'Passkeyの追加に成功しました',
  PASSKEY_ADD_FAILED: 'パスキーの追加に失敗しました',

  // --- Daily Report ---
  CREATE_DAILY_REPORT_SUCCESS: '日報を作成しました',
  CREATE_DAILY_REPORT_FAILED: '日報の作成に失敗しました',
  UPDATE_DAILY_REPORT_SUCCESS: '日報を更新しました',
  UPDATE_DAILY_REPORT_FAILED: '日報の更新に失敗しました',
  NOT_FOUND_DAILY_REPORT: '日報が見つかりません',
  FORBIDDEN_DAILY_REPORT: 'この日報を編集する権限がありません',
  DAILY_REPORT_ALREADY_EXISTS: '本日の日報は既に作成されています',

  // --- Weekly Report ---
  CREATE_WEEKLY_REPORT_SUCCESS: '週報の作成に成功しました',
  CREATE_WEEKLY_REPORT_FAILED: '週報の作成に失敗しました',
  UPDATE_WEEKLY_REPORT_SUCCESS: '週報の更新に成功しました',
  UPDATE_WEEKLY_REPORT_FAILED: '週報の更新に失敗しました',
  NOT_FOUND_WEEKLY_REPORT: '週報が見つかりません',
  FORBIDDEN_WEEKLY_REPORT: 'この週報を編集する権限がありません',

  // --- Client ---
  CLIENT_CREATE_SUCCESS: 'クライアントの登録に成功しました',
  CLIENT_CREATE_FAILED: 'クライアントの登録に失敗しました',
  CLIENT_UPDATE_SUCCESS: 'クライアントの更新に成功しました',
  CLIENT_UPDATE_FAILED: 'クライアントの更新に失敗しました',
  CLIENT_DELETE_SUCCESS: 'クライアントの削除に成功しました',
  CLIENT_DELETE_FAILED: 'クライアントの削除に失敗しました',

  // --- Project ---
  PROJECT_CREATE_SUCCESS: 'プロジェクトの登録に成功しました',
  PROJECT_CREATE_FAILED: 'プロジェクトの登録に失敗しました',
  PROJECT_UPDATE_SUCCESS: 'プロジェクトの更新に成功しました',
  PROJECT_UPDATE_FAILED: 'プロジェクトの更新に失敗しました',
  PROJECT_DELETE_SUCCESS: 'プロジェクトの削除に成功しました',
  PROJECT_DELETE_FAILED: 'プロジェクトの削除に失敗しました',

  // --- Mission ---
  MISSION_CREATE_SUCCESS: 'ミッションの登録に成功しました',
  MISSION_CREATE_FAILED: 'ミッションの登録に失敗しました',
  MISSION_UPDATE_SUCCESS: 'ミッションの更新に成功しました',
  MISSION_UPDATE_FAILED: 'ミッションの更新に失敗しました',
  MISSION_DELETE_SUCCESS: 'ミッションの削除に成功しました',
  MISSION_DELETE_FAILED: 'ミッションの削除に失敗しました',

  // --- Appeal Category ---
  APPEAL_CATEGORY_CREATE_SUCCESS: 'アピールポイントカテゴリーの登録に成功しました',
  APPEAL_CATEGORY_CREATE_FAILED: 'アピールポイントカテゴリーの登録に失敗しました',
  APPEAL_CATEGORY_UPDATE_SUCCESS: 'アピールポイントカテゴリー更新に成功しました',
  APPEAL_CATEGORY_UPDATE_FAILED: 'アピールポイントカテゴリーの更新に失敗しました',
  APPEAL_CATEGORY_DELETE_SUCCESS: 'アピールポイントカテゴリーの削除に成功しました',
  APPEAL_CATEGORY_DELETE_FAILED: 'アピールポイントカテゴリーの削除に失敗しました',

  // --- Trouble Category ---
  TROUBLE_CATEGORY_CREATE_SUCCESS: '困っていることカテゴリーの登録に成功しました',
  TROUBLE_CATEGORY_CREATE_FAILED: '困っていることカテゴリーの登録に失敗しました',
  TROUBLE_CATEGORY_UPDATE_SUCCESS: '困っていることカテゴリー更新に成功しました',
  TROUBLE_CATEGORY_UPDATE_FAILED: '困っていることカテゴリーの更新に失敗しました',
  TROUBLE_CATEGORY_DELETE_SUCCESS: '困っていることカテゴリーの削除に成功しました',
  TROUBLE_CATEGORY_DELETE_FAILED: '困っていることカテゴリーの削除に失敗しました',
} as const
