import { useEffect, useState } from 'react'
import { recentUploads as mockUploads } from '../data/recentUploads'
// BACKEND [Python]: Connect Upload PDF page
import { fetchRecentUploads, uploadDocument } from '../api/documentsApi'

export function useDocuments() {
  const [uploads, setUploads] = useState(mockUploads)
  const [uploading, setUploading] = useState(false)

  // BACKEND [Python]: GET /api/documents/recent — recent uploads sidebar
  useEffect(() => {
    fetchRecentUploads()
      .then((data) => {
        if (data?.items?.length) setUploads(data.items)
      })
      .catch(() => {
        /* keep mock data */
      })
  }, [])

  // BACKEND [Python]: POST /api/documents/upload — file picker / drag-drop
  const uploadFile = async (file, options = {}) => {
    setUploading(true)
    try {
      const result = await uploadDocument(file, options)
      setUploads((prev) => [result, ...prev])
      return result
    } finally {
      setUploading(false)
    }
  }

  return { uploads, uploading, uploadFile }
}
