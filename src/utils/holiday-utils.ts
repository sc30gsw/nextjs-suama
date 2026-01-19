import * as holiday_jp from '@holiday-jp/holiday_jp'

export function getHolidayName(date: Date) {
  const holidays = holiday_jp.between(date, date)

  if (holidays.length > 0) {
    return holidays[0].name
  }

  return null
}

export function getHolidaysInRange(startDate: Date, endDate: Date) {
  const holidays = holiday_jp.between(startDate, endDate)

  return holidays.map((h) => ({
    date: h.date,
    name: h.name,
  }))
}

export function isSaturday(date: Date) {
  return date.getDay() === 6
}

export function isWeekend(date: Date) {
  const day = date.getDay()

  return day === 0 || day === 6
}

export function isSunday(date: Date) {
  return date.getDay() === 0
}

export function isJapaneseHoliday(date: Date) {
  return holiday_jp.isHoliday(date)
}

export function isHolidayOrSunday(date: Date) {
  return isSunday(date) || isJapaneseHoliday(date)
}
