import { useEffect, useState } from 'react'

/** Shows elapsed seconds while `loading` is true. */
export function useGenerationTimer(loading) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!loading) {
      setElapsed(0)
      return undefined
    }
    setElapsed(0)
    const start = Date.now()
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [loading])

  return elapsed
}
