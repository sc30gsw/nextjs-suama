const BASE = '/daily'

const KIND = {
  MINE: 'mine',
  EVERYONE: 'every',
} as const satisfies Record<string, string>

export const DAILY_REPORT = {
  BASE,
  KIND,
} as const satisfies Record<'BASE' | 'KIND', typeof BASE | typeof KIND>
