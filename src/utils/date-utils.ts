import { fromZonedTime } from 'date-fns-tz'
import { APP_TIMEZONE, DATE_TIME } from '~/constants/date'

export const dateUtils = {
  // 日付範囲検索用：指定日のJST開始時刻をUTCで取得
  convertJstDateToUtcStartOfDay: (dateString: string): Date => {
    // ISO文字列が来た場合はyyyy-MM-dd部分だけ抽出
    const cleanDateString = dateString.includes('T') ? dateString.split('T')[0] : dateString
    return fromZonedTime(`${cleanDateString}${DATE_TIME.START}`, APP_TIMEZONE)
  },

  // 日付範囲検索用：指定日のJST終了時刻をUTCで取得
  convertJstDateToUtcEndOfDay: (dateString: string): Date => {
    // ISO文字列が来た場合はyyyy-MM-dd部分だけ抽出
    const cleanDateString = dateString.includes('T') ? dateString.split('T')[0] : dateString
    return fromZonedTime(`${cleanDateString}${DATE_TIME.END}`, APP_TIMEZONE)
  },
} as const satisfies Record<string, (dateString: string) => Date>
