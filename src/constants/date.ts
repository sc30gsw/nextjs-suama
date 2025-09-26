export const DateConstants = {
  APP_TIMEZONE: 'Asia/Tokyo',
  DATE_START_TIME: ' 00:00:00',
  DATE_END_TIME: ' 23:59:59.999',
} as const satisfies Record<string, 'Asia/Tokyo' | ' 00:00:00' | ' 23:59:59.999'>
