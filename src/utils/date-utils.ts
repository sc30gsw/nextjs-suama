import { fromZonedTime } from 'date-fns-tz'
import { APP_TIMEZONE, DATE_TIME } from '~/constants/date'

const SEPARATOR = 'T'

type DateInput = string | `${string}-${string}-${string}${typeof SEPARATOR}${string}`
type DateType = 'start' | 'end'

// TODO: 今後、関数の追加があれば、dateUtilsオブジェクトを追加する。
// 日付範囲検索用：指定日のJST開始/終了時刻をUTCで取得
export const convertJstDateToUtc = (dateStr: DateInput, type: DateType): Date => {
  // ISO文字列が来た場合はyyyy-MM-dd部分だけ抽出
  const cleanDateString = dateStr.includes(SEPARATOR) ? dateStr.split(SEPARATOR)[0] : dateStr
  const dateTime = type === 'start' ? DATE_TIME.START : DATE_TIME.END

  return fromZonedTime(`${cleanDateString}${dateTime}`, APP_TIMEZONE)
}
