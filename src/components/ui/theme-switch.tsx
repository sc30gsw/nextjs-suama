'use client'

import { useTheme } from 'next-themes'
import { useRef } from 'react'
import { flushSync } from 'react-dom'
import { Switch } from '~/components/ui/intent-ui/switch'

type ThemeSwitchProps = Partial<{
  duration: number
  className: string
}>

export function ThemeSwitch({ duration = 400, className }: ThemeSwitchProps) {
  const { theme, setTheme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const isDark = theme === 'dark'

  async function toggleTheme() {
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

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2

    if (containerRef.current) {
      const { top, left, width, height } = containerRef.current.getBoundingClientRect()
      x = left + width / 2
      y = top + height / 2
    }

    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    document.documentElement.animate(
      {
        clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`],
      },
      {
        duration,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      },
    )
  }

  return (
    <div ref={containerRef}>
      <Switch
        className={className}
        isSelected={isDark}
        onChange={toggleTheme}
        aria-label="テーマを切り替え"
      />
    </div>
  )
}
