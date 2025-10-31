// ? Offered by Magic UI
// ? https://magicui.design/docs/components/animated-theme-toggler
// ? https://v0.app/chat/open-in-v0-WbcZ9oKky84

import { useTheme } from 'next-themes'
import { useRef } from 'react'
import { flushSync } from 'react-dom'
import { Switch } from '~/components/ui/intent-ui/switch'

const DEFAULT_ANIMATION_DURATION = 400
const SCREEN_CENTER_DIVISOR = 2
const CIRCLE_INITIAL_RADIUS = 0

type ThemeSwitchProps = Partial<{
  duration: number
  className: string
}>

export function ThemeSwitch({
  duration = DEFAULT_ANIMATION_DURATION,
  className,
}: ThemeSwitchProps) {
  const { theme, setTheme } = useTheme()
  const containerRef = useRef<HTMLButtonElement>(null)
  const isDark = theme === 'dark'

  const toggleTheme = async () => {
    const newTheme = isDark ? 'light' : 'dark'

    if (!document.startViewTransition) {
      setTheme(newTheme)

      return
    }

    await document.startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme)
      })
    }).ready

    let x = window.innerWidth / SCREEN_CENTER_DIVISOR
    let y = window.innerHeight / SCREEN_CENTER_DIVISOR

    if (containerRef.current) {
      const { top, left, width, height } = containerRef.current.getBoundingClientRect()

      x = left + width / SCREEN_CENTER_DIVISOR
      y = top + height / SCREEN_CENTER_DIVISOR
    }

    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    document.documentElement.animate(
      {
        clipPath: [
          `circle(${CIRCLE_INITIAL_RADIUS}px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      },
    )
  }

  return (
    <button
      type="button"
      ref={containerRef}
      // ? Intent UIのMenuがonPointerUpないしonPointerDownでイベントを検知し、Menuが閉じるためイベント伝播を防止
      // ? onClickはpointerUp/Downを内包するが、onClickだとMenuが閉じてしまうため、onPointerUpを使用
      onPointerUp={(e) => e.stopPropagation()}
    >
      <Switch
        className={className}
        isSelected={isDark}
        onChange={toggleTheme}
        aria-label="テーマを切り替え"
      />
    </button>
  )
}
