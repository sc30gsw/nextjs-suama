import { ERROR_STATUS, type ErrorStatus } from '~/constants/error-message'

// エラーステータスかどうかを判定する型ガード関数
export const isErrorStatus = (value: string | undefined): value is ErrorStatus => {
  if (value === undefined) {
    return false
  }

  return Object.values(ERROR_STATUS).includes(value as ErrorStatus)
}
