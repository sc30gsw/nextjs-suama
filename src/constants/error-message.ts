export const ERROR_STATUS = {
  UNAUTHORIZED: 'Unauthorized',
  NOT_FOUND: 'NotFound',
  FOR_BIDDEN: 'Forbidden',
} as const satisfies Record<string, string>

export type ErrorStatus = (typeof ERROR_STATUS)[keyof typeof ERROR_STATUS]

export const TOAST_MESSAGES = {
  AUTH: {
    SIGN_IN_SUCCESS: 'サインインしました',
    SIGN_IN_FAILED: 'サインインに失敗しました',
    SIGN_UP_SUCCESS: 'サインアップしました',
    SIGN_UP_FAILED: 'サインアップに失敗しました',
    SIGN_OUT_SUCCESS: 'ログアウトしました',
    SIGN_OUT_FAILED: 'ログアウトに失敗しました',
    UNAUTHORIZED: 'セッションが切れました。再度ログインしてください',
  },

  PASSWORD: {
    RESET_SUCCESS: 'パスワードリセットに成功しました',
    RESET_FAILED: 'パスワードリセットに失敗しました',
    RESET_REDIRECT: 'パスワードリセット画面にリダイレクトします',
    RESET_REDIRECT_FAILED: 'パスワードリセット画面にリダイレクトできませんでした',
    CHANGE_SUCCESS: 'パスワードの変更に成功しました',
    CHANGE_FAILED: 'パスワードの変更に失敗しました',
  },

  USER: {
    UPDATE_SUCCESS: 'ユーザーの更新に成功しました',
    UPDATE_FAILED: 'ユーザーの更新に失敗しました',
    DELETE_SUCCESS: 'ユーザーの削除に成功しました',
    DELETE_FAILED: 'ユーザーの削除に失敗しました',
    PASSKEY_ADD_SUCCESS: 'Passkeyの追加に成功しました',
    PASSKEY_ADD_FAILED: 'パスキーの追加に失敗しました',
  },

  DAILY_REPORT: {
    CREATE_SUCCESS: '日報を作成しました',
    CREATE_FAILED: '日報の作成に失敗しました',
    UPDATE_SUCCESS: '日報を更新しました',
    UPDATE_FAILED: '日報の更新に失敗しました',
    NOT_FOUND: '日報が見つかりません',
    FORBIDDEN: 'この日報を編集する権限がありません',
    ALREADY_EXISTS: '本日の日報は既に作成されています',
  },

  WEEKLY_REPORT: {
    CREATE_SUCCESS: '週報の作成に成功しました',
    CREATE_FAILED: '週報の作成に失敗しました',
    UPDATE_SUCCESS: '週報の更新に成功しました',
    UPDATE_FAILED: '週報の更新に失敗しました',
    NOT_FOUND: '週報が見つかりません',
    FORBIDDEN: 'この週報を編集する権限がありません',
  },

  CLIENT: {
    CREATE_SUCCESS: 'クライアントの登録に成功しました',
    CREATE_FAILED: 'クライアントの登録に失敗しました',
    UPDATE_SUCCESS: 'クライアントの更新に成功しました',
    UPDATE_FAILED: 'クライアントの更新に失敗しました',
    DELETE_SUCCESS: 'クライアントの削除に成功しました',
    DELETE_FAILED: 'クライアントの削除に失敗しました',
  },

  PROJECT: {
    CREATE_SUCCESS: 'プロジェクトの登録に成功しました',
    CREATE_FAILED: 'プロジェクトの登録に失敗しました',
    UPDATE_SUCCESS: 'プロジェクトの更新に成功しました',
    UPDATE_FAILED: 'プロジェクトの更新に失敗しました',
    DELETE_SUCCESS: 'プロジェクトの削除に成功しました',
    DELETE_FAILED: 'プロジェクトの削除に失敗しました',
  },

  MISSION: {
    CREATE_SUCCESS: 'ミッションの登録に成功しました',
    CREATE_FAILED: 'ミッションの登録に失敗しました',
    UPDATE_SUCCESS: 'ミッションの更新に成功しました',
    UPDATE_FAILED: 'ミッションの更新に失敗しました',
    DELETE_SUCCESS: 'ミッションの削除に成功しました',
    DELETE_FAILED: 'ミッションの削除に失敗しました',
  },

  APPEAL: {
    CREATE_SUCCESS: 'アピールポイントカテゴリーの登録に成功しました',
    CREATE_FAILED: 'アピールポイントカテゴリーの登録に失敗しました',
    UPDATE_SUCCESS: 'アピールポイントカテゴリー更新に成功しました',
    UPDATE_FAILED: 'アピールポイントカテゴリーの更新に失敗しました',
    DELETE_SUCCESS: 'アピールポイントカテゴリーの削除に成功しました',
    DELETE_FAILED: 'アピールポイントカテゴリーの削除に失敗しました',
  },

  TROUBLE: {
    CREATE_SUCCESS: '困っていることカテゴリーの登録に成功しました',
    CREATE_FAILED: '困っていることカテゴリーの登録に失敗しました',
    UPDATE_SUCCESS: '困っていることカテゴリー更新に成功しました',
    UPDATE_FAILED: '困っていることカテゴリーの更新に失敗しました',
    DELETE_SUCCESS: '困っていることカテゴリーの削除に成功しました',
    DELETE_FAILED: '困っていることカテゴリーの削除に失敗しました',
  },
} as const satisfies Record<string, Record<string, string>>
