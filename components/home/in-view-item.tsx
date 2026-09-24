"use client"

import { useEffect, useRef } from "react"

/**
 * List item that marks itself with `data-inview="true"` while it crosses the middle band of the
 * screen. Only on touch devices (no hover): there it stands in for `:hover`, so styles written as
 * `group-data-[inview=true]:…` next to `group-hover:…` behave the same on phones.
 * The attribute is set directly on the element, so scrolling never re-renders React.
 */
export function InViewItem({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLLIElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia("(hover: none)").matches) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        el.dataset.inview = String(entry.isIntersecting)
      },
      { rootMargin: "-45% 0px -45% 0px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <li ref={ref} data-inview="false" className={className}>
      {children}
    </li>
  )
}
