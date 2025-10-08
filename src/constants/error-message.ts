export const ERROR_STATUS = {
  UNAUTHORIZED: 'Unauthorized',
  NOT_FOUND: 'NotFound',
  FOR_BIDDEN: 'Forbidden',
  ALREADY_EXISTS: 'AlreadyExists',
  SOMETHING_WENT_WRONG: 'SomethingWentWrong',
  EMAIL_NOT_FOUND: 'EmailNotFound',
  INVALID_PROJECT_RELATION: 'InvalidProjectRelation',
  INVALID_MISSION_RELATION: 'InvalidMissionRelation',
  INVALID_CLIENT_RELATION: 'InvalidClientRelation',
} as const satisfies Record<string, string>

export type ErrorStatus = (typeof ERROR_STATUS)[keyof typeof ERROR_STATUS]

export const TOAST_MESSAGES = {
  COMMON: {
    SOMETHING_WENT_WRONG: '予期しないエラーが発生しました',
  },

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
    NOT_FOUND: 'ユーザーが見つかりません',
    EMAIL_ALREADY_EXISTS: '入力されたメールアドレスは既に使用されています',
    PASSKEY_ADD_SUCCESS: 'Passkeyの追加に成功しました',
    PASSKEY_ADD_FAILED: 'パスキーの追加に失敗しました',
    EMAIL_NOT_FOUND: 'そのメールアドレスは登録されていません',
    NAME_OR_EMAIL_ALREADY_EXISTS: 'メールアドレスまたは名前は既に使用されています',
  },

  DAILY_REPORT: {
    CREATE_SUCCESS: '日報を作成しました',
    CREATE_FAILED: '日報の作成に失敗しました',
    UPDATE_SUCCESS: '日報を更新しました',
    UPDATE_FAILED: '日報の更新に失敗しました',
    DELETE_SUCCESS: '日報を削除しました',
    DELETE_FAILED: '日報の削除に失敗しました',
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
    NOT_FOUND: 'クライアントが見つかりません',
    INVALID_RELATION:
      'クライアントが存在しません。再度、選択し直すか、クライアントの登録を行ってください。',
  },

  PROJECT: {
    CREATE_SUCCESS: 'プロジェクトの登録に成功しました',
    CREATE_FAILED: 'プロジェクトの登録に失敗しました',
    UPDATE_SUCCESS: 'プロジェクトの更新に成功しました',
    UPDATE_FAILED: 'プロジェクトの更新に失敗しました',
    DELETE_SUCCESS: 'プロジェクトの削除に成功しました',
    DELETE_FAILED: 'プロジェクトの削除に失敗しました',
    NOT_FOUND: 'プロジェクトが見つかりません',
    INVALID_CLIENT: '未登録のクライアントが選択されています',
    INVALID_RELATION:
      'プロジェクトが存在しません。再度、選択し直すか、プロジェクトの登録を行ってください。',
  },

  MISSION: {
    CREATE_SUCCESS: 'ミッションの登録に成功しました',
    CREATE_FAILED: 'ミッションの登録に失敗しました',
    UPDATE_SUCCESS: 'ミッションの更新に成功しました',
    UPDATE_FAILED: 'ミッションの更新に失敗しました',
    DELETE_SUCCESS: 'ミッションの削除に成功しました',
    DELETE_FAILED: 'ミッションの削除に失敗しました',
    NOT_FOUND: 'ミッションが見つかりません',
    INVALID_PROJECT: '未登録のプロジェクトが選択されています',
    INVALID_RELATION:
      'ミッションが存在しません。再度、選択し直すか、ミッションの登録を行ってください。',
  },

  APPEAL: {
    CREATE_SUCCESS: 'アピールポイントカテゴリーの登録に成功しました',
    CREATE_FAILED: 'アピールポイントカテゴリーの登録に失敗しました',
    UPDATE_SUCCESS: 'アピールポイントカテゴリー更新に成功しました',
    UPDATE_FAILED: 'アピールポイントカテゴリーの更新に失敗しました',
    DELETE_SUCCESS: 'アピールポイントカテゴリーの削除に成功しました',
    DELETE_FAILED: 'アピールポイントカテゴリーの削除に失敗しました',
    NOT_FOUND: 'アピールポイントカテゴリーが見つかりません',
  },

  TROUBLE: {
    CREATE_SUCCESS: '困っていることカテゴリーの登録に成功しました',
    CREATE_FAILED: '困っていることカテゴリーの登録に失敗しました',
    UPDATE_SUCCESS: '困っていることカテゴリー更新に成功しました',
    UPDATE_FAILED: '困っていることカテゴリーの更新に失敗しました',
    DELETE_SUCCESS: '困っていることカテゴリーの削除に成功しました',
    DELETE_FAILED: '困っていることカテゴリーの削除に失敗しました',
    NOT_FOUND: '困っていることカテゴリーが見つかりません',
  },
} as const satisfies Record<string, Record<string, string>>
