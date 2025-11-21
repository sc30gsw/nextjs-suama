import { IconArrowUp } from '@intentui/icons'
import type { RefObject } from 'react'
import { useEffect } from 'react'
import { useToggle } from 'react-use'
import type { VirtuosoHandle } from 'react-virtuoso'
import { Button } from '~/components/ui/intent-ui/button'
import { cn } from '~/utils/classes'

export function WeeklyReportsBackToTopButton({
  virtuosoRef,
}: Record<'virtuosoRef', RefObject<VirtuosoHandle | null>>) {
  const [isVisible, toggle] = useToggle(false)

  useEffect(() => {
    const handleScroll = () => {
      toggle(scrollY > 300)
    }

    addEventListener('scroll', handleScroll)
    return () => removeEventListener('scroll', handleScroll)
  }, [toggle])

  //? react-scrollだとカクつくため
  const scrollToTop = () => {
    // ? Virtuosoと競合し、ページ上部に戻らずViewPort内の Virtuosoの先頭に戻るため、refを使用し、Virtuoso側もスクロールさせる
    if (virtuosoRef?.current) {
      virtuosoRef.current.scrollToIndex({ index: 0, align: 'start', behavior: 'smooth' })

      return
    }

    scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Button
      size="sq-sm"
      onPress={scrollToTop}
      className={cn(
        'fixed right-6 bottom-6 z-50 rounded-full bg-primary p-3 text-white shadow-lg transition-opacity lg:right-80',
        isVisible ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      <IconArrowUp />
    </Button>
  )
}
