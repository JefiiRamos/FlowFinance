import * as React from 'react'

const LG_MIN = 1024

/** Alinhado ao breakpoint `lg:` do Tailwind (sidebar desktop). */
export function useLgUp() {
  const [lgUp, setLgUp] = React.useState(false)

  React.useLayoutEffect(() => {
    const mql = window.matchMedia(`(min-width: ${LG_MIN}px)`)
    const onChange = () => setLgUp(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return lgUp
}
