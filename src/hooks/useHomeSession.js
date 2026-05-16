import { useCallback, useEffect, useState } from 'react'
import { fetchHealth, fetchHomeSession } from '../api/homeApi'
import { DEFAULT_AVATARS } from '../data/defaultAvatars'

const HEALTH_RETRIES = 4
const HEALTH_RETRY_MS = 1500

async function pingBackend() {
  let lastError
  for (let attempt = 0; attempt < HEALTH_RETRIES; attempt += 1) {
    try {
      await fetchHealth()
      return true
    } catch (err) {
      lastError = err
      if (attempt < HEALTH_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, HEALTH_RETRY_MS))
      }
    }
  }
  throw lastError
}

export function useHomeSession() {
  const [avatars, setAvatars] = useState(DEFAULT_AVATARS)
  const [sourceFile, setSourceFile] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [pipelineSource, setPipelineSource] = useState('')
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [sessionError, setSessionError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setSessionError('')

    try {
      await pingBackend()
      setOffline(false)
    } catch {
      setOffline(true)
      setLoading(false)
      return
    }

    try {
      const data = await fetchHomeSession()
      if (data?.source_file) setSourceFile(data.source_file)
      if (Array.isArray(data?.avatars) && data.avatars.length) setAvatars(data.avatars)
      if (data?.metrics) setMetrics(data.metrics)
      if (data?.pipeline_source) setPipelineSource(data.pipeline_source)
      if (data?.supabase_warning) setSessionError(data.supabase_warning)
    } catch {
      setSessionError('Session load failed — uploads still work from local disk.')
      setAvatars(DEFAULT_AVATARS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return {
    avatars,
    sourceFile,
    setSourceFile,
    metrics,
    pipelineSource,
    loading,
    offline,
    sessionError,
    reload: load,
  }
}
