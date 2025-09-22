import { fromZonedTime } from 'date-fns-tz'
import { DateConstants } from '~/constants/date'

type DateUtilsType = {
  readonly toJstStartOfDay: (dateString: string) => Date
  readonly toJstEndOfDay: (dateString: string) => Date
}

export const DateUtils = {
  // JSTの日の開始時刻としてUTCに変換
  toJstStartOfDay: (dateString: string): Date => {
    // ISO文字列が来た場合はyyyy-MM-dd部分だけ抽出
    const cleanDateString = dateString.includes('T') ? dateString.split('T')[0] : dateString
    return fromZonedTime(`${cleanDateString}${DateConstants.DATE_START_TIME}`, DateConstants.APP_TIMEZONE)
  },

  // JSTの日の終了時刻としてUTCに変換
  toJstEndOfDay: (dateString: string): Date => {
    // ISO文字列が来た場合はyyyy-MM-dd部分だけ抽出
    const cleanDateString = dateString.includes('T') ? dateString.split('T')[0] : dateString
    return fromZonedTime(`${cleanDateString}${DateConstants.DATE_END_TIME}`, DateConstants.APP_TIMEZONE)
  },
} as const satisfies DateUtilsType
