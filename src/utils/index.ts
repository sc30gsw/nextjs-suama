import { ERROR_STATUS, type ErrorStatus } from '~/constants/error-message'

export const isErrorStatus = (value: string | undefined): value is ErrorStatus => {
  if (value === undefined) {
    return false
  }

  return Object.values(ERROR_STATUS).includes(value as ErrorStatus)
}
