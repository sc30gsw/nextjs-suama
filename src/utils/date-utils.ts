import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz'
import { APP_TIMEZONE, DATE_TIME } from '~/constants/date'

export const SEPARATOR = 'T'
export const DATE_FORMAT = 'yyyy-MM-dd'

type DateInput = string | `${string}-${string}-${string}${typeof SEPARATOR}${string}`
type DateType = 'start' | 'end'

// 日付ユーティリティ関数
export const dateUtils = {
  // 日付範囲検索用：指定日のJST開始/終了時刻をUTCで取得
  convertJstDateToUtc: (dateStr: DateInput, type: DateType): Date => {
    // ISO文字列が来た場合はyyyy-MM-dd部分だけ抽出
    const cleanDateString = dateStr.includes(SEPARATOR) ? dateStr.split(SEPARATOR)[0] : dateStr
    const dateTime = type === 'start' ? DATE_TIME.START : DATE_TIME.END

    return fromZonedTime(`${cleanDateString}${dateTime}`, APP_TIMEZONE)
  },

  // JST基準で日付をフォーマット
  formatDateInJST: (date: Date | number | string, formatStr = DATE_FORMAT): string => {
    return formatInTimeZone(date, APP_TIMEZONE, formatStr)
  },

  // JSTの今日の開始/終了時刻をUTCで取得
  getTodayRangeInJST: (): { start: Date; end: Date } => {
    const nowInJST = toZonedTime(new Date(), APP_TIMEZONE)
    const dateString = formatInTimeZone(nowInJST, APP_TIMEZONE, DATE_FORMAT)

    return {
      start: dateUtils.convertJstDateToUtc(dateString, 'start'),
      end: dateUtils.convertJstDateToUtc(dateString, 'end'),
    }
  },
} as const
