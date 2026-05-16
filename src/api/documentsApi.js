import { API_BASE_URL } from './config'
import { apiGet, apiUpload } from './client'

/** POST /documents/upload — Upload PDF page (Browse / drag-drop) */
export function uploadDocument(file, options = {}) {
  const formData = new FormData()
  formData.append('file', file)
  if (options.pageStart) formData.append('page_start', options.pageStart)
  if (options.pageEnd) formData.append('page_end', options.pageEnd)
  if (options.extraction) formData.append('extraction', JSON.stringify(options.extraction))
  return apiUpload('/documents/upload', formData)
}

/** GET /documents/recent — Upload page recent uploads list */
export function fetchRecentUploads() {
  return apiGet('/documents/recent')
}

/** DELETE /documents/:id — Remove uploaded file (Home + Upload pages) */
export async function deleteDocument(documentId) {
  const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, { method: 'DELETE' })
  if (!response.ok) throw new Error('Delete failed')
  return response.json().catch(() => ({}))
}
