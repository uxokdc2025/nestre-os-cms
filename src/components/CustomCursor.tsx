'use client'

import { useEffect } from 'react'

// Custom cursor (à la neiden): a small dot that tracks the pointer exactly and a
// larger ring that follows with easing. The ring grows over interactive/media
// elements. Fine-pointer devices only — never on touch, and respects reduced motion.
export function CustomCursor() {
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    if (!fine) return

    const dot = document.createElement('div')
    dot.className = 'cursor-dot'
    const ring = document.createElement('div')
    ring.className = 'cursor-ring'
    document.body.append(ring, dot)
    document.documentElement.classList.add('has-cursor')

    let mx = window.innerWidth / 2, my = window.innerHeight / 2
    let rx = mx, ry = my
    let raf = 0
    const HOVER_SEL = 'a,button,[role="button"],input,textarea,select,label,.rail-arrow,.phone,.panel,.ncard,.thumb-lg,.tag,.btn,summary'

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`
      const t = e.target as Element | null
      const hovering = !!t?.closest?.(HOVER_SEL)
      ring.classList.toggle('hover', hovering)
      if (!raf) raf = requestAnimationFrame(loop)
    }
    const loop = () => {
      raf = 0
      rx += (mx - rx) * 0.18
      ry += (my - ry) * 0.18
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`
      if (Math.abs(mx - rx) > 0.4 || Math.abs(my - ry) > 0.4) raf = requestAnimationFrame(loop)
    }
    const onDown = () => ring.classList.add('down')
    const onUp = () => ring.classList.remove('down')
    const onLeave = () => { dot.style.opacity = '0'; ring.style.opacity = '0' }
    const onEnter = () => { dot.style.opacity = ''; ring.style.opacity = '' }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      if (raf) cancelAnimationFrame(raf)
      dot.remove(); ring.remove()
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])
  return null
}
