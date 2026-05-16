import { useEffect, useState } from 'react'
import { fetchRecentUploads, uploadDocument } from '../api/documentsApi'

export function useDocuments() {
  const [uploads, setUploads] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadRecent = () => {
    setLoading(true)
    return fetchRecentUploads()
      .then((data) => {
        if (Array.isArray(data?.items)) setUploads(data.items)
      })
      .catch(() => setUploads([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadRecent()
  }, [])

  const uploadFile = async (file, options = {}) => {
    setUploading(true)
    setUploadError('')
    try {
      const result = await uploadDocument(file, options)
      setUploads((prev) => [result, ...prev.filter((item) => item.id !== result.id)])
      return result
    } catch (err) {
      const message = err?.message || 'Upload failed. Is the backend running?'
      setUploadError(message)
      throw err
    } finally {
      setUploading(false)
    }
  }

  return { uploads, uploading, uploadError, loading, uploadFile, refreshUploads: loadRecent }
}
