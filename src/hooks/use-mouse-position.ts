import { useEffect, useState } from 'react'

export function useMousePosition(ref: React.RefObject<HTMLElement | null>) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const element = ref?.current

    if (!element) {
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()

      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }

    const handleMouseLeave = () => {
      setMousePosition({ x: 0, y: 0 })
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [ref])

  return mousePosition
}
