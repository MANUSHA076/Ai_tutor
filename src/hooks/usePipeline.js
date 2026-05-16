import { useCallback, useEffect, useState } from 'react'
import { fetchPipelineStatus, processDocument, ragQuery } from '../api/pipelineApi'

export function usePipeline() {
  const [processing, setProcessing] = useState(false)
  const [indexing, setIndexing] = useState(false)
  const [processError, setProcessError] = useState('')
  const [ragSource, setRagSource] = useState('')
  const [chunkPreview, setChunkPreview] = useState([])

  const syncIndexedSources = useCallback(() => {
    return fetchPipelineStatus()
      .then((data) => {
        const sources = data?.indexed_sources
        if (Array.isArray(sources) && sources.length > 0 && !ragSource) {
          setRagSource(sources[sources.length - 1])
        }
        return data
      })
      .catch(() => null)
  }, [ragSource])

  useEffect(() => {
    syncIndexedSources()
  }, [syncIndexedSources])

  const pollUntilReady = (sourceName) => {
    let attempts = 0
    const tick = () => {
      fetchPipelineStatus()
        .then((data) => {
          const job = data?.jobs?.[sourceName]
          if (job?.status === 'ready') {
            setIndexing(false)
            if (Array.isArray(job.preview)) setChunkPreview(job.preview)
            return
          }
          if (job?.status === 'failed') {
            setIndexing(false)
            setProcessError(job.error || 'Indexing failed')
            return
          }
          if (data?.indexed_sources?.includes(sourceName)) {
            setIndexing(false)
            return
          }
          attempts += 1
          if (attempts < 120) setTimeout(tick, 3000)
          else setIndexing(false)
        })
        .catch(() => setIndexing(false))
    }
    setTimeout(tick, 3000)
  }

  const runProcess = async (storagePath, options = {}) => {
    if (!storagePath) {
      throw new Error('No storage path for this document')
    }
    setProcessing(true)
    setProcessError('')
    try {
      const data = await processDocument(storagePath, options)
      if (data?.source) {
        setRagSource(data.source)
        if (data.status === 'processing') {
          setIndexing(true)
          pollUntilReady(data.source)
        }
      }
      if (Array.isArray(data?.preview) && data.preview.length) setChunkPreview(data.preview)
      return data
    } catch (err) {
      const message = err?.message || 'Processing failed. Run install-ml.ps1 if ML deps are missing.'
      setProcessError(message)
      throw err
    } finally {
      setProcessing(false)
    }
  }

  const searchRag = async (query, source = ragSource, topN = 5) => {
    if (!source?.trim()) {
      throw new Error('Process a PDF first to search the knowledge base.')
    }
    if (!query?.trim()) return { results: [] }
    return ragQuery({ source, query: query.trim(), topN })
  }

  return {
    processing,
    indexing,
    processError,
    ragSource,
    setRagSource,
    chunkPreview,
    runProcess,
    searchRag,
    syncIndexedSources,
  }
}
