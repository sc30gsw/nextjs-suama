'use client'

import type { HTMLAttributes } from 'react'
import { useRef } from 'react'
import { Card } from '~/components/ui/intent-ui/card'
import { useTheme } from '~/components/ui/intent-ui/theme-provider'
import { useMousePosition } from '~/hooks/use-mouse-position'
import { cn } from '~/utils/classes'

interface GlowCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function GlowCard({ className, children, ...props }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const { x, y } = useMousePosition(cardRef)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div ref={cardRef} className={cn('relative', className)} {...props}>
      {/* Light mode background glow - wider range */}
      <div
        className="-inset-[2px] pointer-events-none absolute rounded-lg transition-opacity duration-300 dark:hidden"
        style={{
          background: `radial-gradient(850px circle at ${x}px ${y}px, rgba(59, 130, 246, 0.4), transparent 45%)`,
          opacity: x > 0 && y > 0 ? 1 : 0,
          filter: 'blur(8px)',
          zIndex: 0,
        }}
      />
      {/* Light mode center glow - stronger at mouse position */}
      <div
        className="-inset-[2px] pointer-events-none absolute rounded-lg transition-opacity duration-300 dark:hidden"
        style={{
          background: `radial-gradient(400px circle at ${x}px ${y}px, rgba(59, 130, 246, 0.7), transparent 60%)`,
          opacity: x > 0 && y > 0 ? 1 : 0,
          filter: 'blur(6px)',
          zIndex: 0,
        }}
      />
      {/* Dark mode background glow - wider range */}
      <div
        className="-inset-[2px] pointer-events-none absolute hidden rounded-lg transition-opacity duration-300 dark:block"
        style={{
          background: `radial-gradient(850px circle at ${x}px ${y}px, rgba(96, 165, 250, 0.5), transparent 45%)`,
          opacity: x > 0 && y > 0 ? 1 : 0,
          filter: 'blur(8px)',
          zIndex: 0,
        }}
      />
      {/* Dark mode center glow - stronger at mouse position */}
      <div
        className="-inset-[2px] pointer-events-none absolute hidden rounded-lg transition-opacity duration-300 dark:block"
        style={{
          background: `radial-gradient(400px circle at ${x}px ${y}px, rgba(96, 165, 250, 0.8), transparent 60%)`,
          opacity: x > 0 && y > 0 ? 1 : 0,
          filter: 'blur(6px)',
          zIndex: 0,
        }}
      />
      <Card
        className="relative z-10"
        style={{
          ...(x > 0 && y > 0
            ? isDark
              ? {
                  borderColor: 'rgba(96, 165, 250, 0.7)',
                  boxShadow: `0 0 0 1px rgba(96, 165, 250, 0.7), 0 0 20px 2px rgba(96, 165, 250, 0.5)`,
                }
              : {
                  borderColor: 'rgba(59, 130, 246, 0.6)',
                  boxShadow: `0 0 0 1px rgba(59, 130, 246, 0.6), 0 0 20px 2px rgba(59, 130, 246, 0.4)`,
                }
            : {}),
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        {children}
      </Card>
    </div>
  )
}
