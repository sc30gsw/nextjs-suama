export const APP_TIMEZONE = 'Asia/Tokyo' as const

export const DATE_TIME = {
  START: ' 00:00:00',
  END: ' 23:59:59.999',
} as const satisfies Record<string, ' 00:00:00' | ' 23:59:59.999'>
