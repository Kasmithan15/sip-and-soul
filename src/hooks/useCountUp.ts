import { useEffect, useState } from 'react'

/** Counts from 0 to `target` with an ease-out curve once `start` is true. */
export function useCountUp(target: number, start: boolean, duration = 1800) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!start) return
    let frame: number
    const begin = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - begin) / duration, 1)
      setValue(target * (1 - Math.pow(1 - progress, 3)))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, start, duration])

  return value
}
