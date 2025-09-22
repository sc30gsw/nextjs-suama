import { fromZonedTime } from 'date-fns-tz'
import { DateConstants } from '~/constants/date'

type DateUtilsType = {
  readonly toJstStartOfDay: (dateString: string) => Date
  readonly toJstEndOfDay: (dateString: string) => Date
}

export const DateUtils = {
  // 日付範囲検索用：指定日のJST開始時刻をUTCで取得
  toJstStartOfDay: (dateString: string): Date => {
    // ISO文字列が来た場合はyyyy-MM-dd部分だけ抽出
    const cleanDateString = dateString.includes('T') ? dateString.split('T')[0] : dateString
    return fromZonedTime(`${cleanDateString}${DateConstants.DATE_START_TIME}`, DateConstants.APP_TIMEZONE)
  },

  // 日付範囲検索用：指定日のJST終了時刻をUTCで取得
  toJstEndOfDay: (dateString: string): Date => {
    // ISO文字列が来た場合はyyyy-MM-dd部分だけ抽出
    const cleanDateString = dateString.includes('T') ? dateString.split('T')[0] : dateString
    return fromZonedTime(`${cleanDateString}${DateConstants.DATE_END_TIME}`, DateConstants.APP_TIMEZONE)
  },
} as const satisfies DateUtilsType
