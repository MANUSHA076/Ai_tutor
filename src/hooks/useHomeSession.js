import { useEffect, useState } from 'react'
import { fetchHomeSession } from '../api/homeApi'

export function useHomeSession() {
  const [avatars, setAvatars] = useState([])
  const [sourceFile, setSourceFile] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    return fetchHomeSession()
      .then((data) => {
        if (data?.source_file) setSourceFile(data.source_file)
        if (Array.isArray(data?.avatars)) setAvatars(data.avatars)
        if (data?.metrics) setMetrics(data.metrics)
      })
      .catch(() => {
        setAvatars([])
        setSourceFile(null)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  return { avatars, sourceFile, setSourceFile, metrics, loading, reload: load }
}
