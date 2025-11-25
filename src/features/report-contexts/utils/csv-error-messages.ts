export const CSV_ERROR_MESSAGES = {
  PARSE_FAILED: 'CSVの解析に失敗しました',
  NO_DATA: 'CSVファイルにデータが含まれていません',
  MISSING_COLUMNS: '必須カラムが見つかりません',
  INVALID_COLUMNS: '不正なカラム名があります',
  REGISTRATION_FAILED: 'データの登録・更新に失敗しました',
} as const satisfies Record<string, string>
