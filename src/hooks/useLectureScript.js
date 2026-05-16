import { useEffect, useState } from 'react'
import { fetchLectureScript } from '../api/homeApi'

export function useLectureScript(activeTab, ragSource = '') {
  const [lines, setLines] = useState([])
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetchLectureScript(activeTab, ragSource ? { source: ragSource } : {})
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
  }, [activeTab, ragSource])

  return { lines, summary, loading }
}
