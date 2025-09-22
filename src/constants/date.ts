type DateConstantsType = {
  readonly APP_TIMEZONE: 'Asia/Tokyo'
  readonly DATE_START_TIME: ' 00:00:00'
  readonly DATE_END_TIME: ' 23:59:59.999'
}

export const DateConstants = {
  APP_TIMEZONE: 'Asia/Tokyo',
  DATE_START_TIME: ' 00:00:00',
  DATE_END_TIME: ' 23:59:59.999',
} as const satisfies DateConstantsType