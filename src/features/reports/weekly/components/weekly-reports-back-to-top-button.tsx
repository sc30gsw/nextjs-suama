'use client'

import { IconArrowUp } from '@intentui/icons'
import { useEffect } from 'react'
import { useToggle } from 'react-use'
import { Button } from '~/components/ui/intent-ui/button'
import { cn } from '~/utils/classes'

export function WeeklyReportsBackToTopButton() {
  const [isVisible, toggle] = useToggle(false)

  useEffect(() => {
    const handleScroll = () => {
      toggle(scrollY > 300)
    }

    addEventListener('scroll', handleScroll)
    return () => removeEventListener('scroll', handleScroll)
  }, [toggle])

  // react-scrollだとカクつくため
  const scrollToTop = () => {
    scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Button
      size="square-petite"
      onPress={scrollToTop}
      className={cn(
        'fixed bottom-6 right-6 lg:right-80 z-50 p-3 rounded-full bg-primary text-white shadow-lg transition-opacity',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
      )}
    >
      <IconArrowUp />
    </Button>
  )
}
