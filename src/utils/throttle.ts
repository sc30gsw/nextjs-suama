import { funnel } from 'remeda'

// ?https://remedajs.com/migrate/lodash/#throttle
export function throttle<F extends (...args: any[]) => void>(func: F, wait = 100) {
  const { call } = funnel(
    (args: Parameters<F>) => {
      func(...args)
    },
    {
      reducer: (_, ...args: Parameters<F>) => args,
      minQuietPeriodMs: wait,
      maxBurstDurationMs: wait,
      triggerAt: 'both',
    },
  )

  return (...args: Parameters<F>) => call(...args)
}
