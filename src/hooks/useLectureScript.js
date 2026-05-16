import { useEffect, useState } from 'react'
import { fetchLectureScript } from '../api/homeApi'

export function useLectureScript(activeTab) {
  const [lines, setLines] = useState([])
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetchLectureScript(activeTab)
      .then((data) => {
        if (cancelled) return
        setLines(Array.isArray(data?.lines) ? data.lines : [])
        setSummary(Array.isArray(data?.summary) ? data.summary : [])
      })
      .catch(() => {
        if (!cancelled) {
          setLines([])
          setSummary([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [activeTab])

  return { lines, summary, loading }
}
