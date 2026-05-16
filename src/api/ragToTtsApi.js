import { API_BASE_URL } from './config'

/**
 * POST /rag-to-tts — PDF + text → RAG TTS (proxies to RAG_TTS_API_URL)
 * @param {string} textMessage
 * @param {File} pdfFile - raw File from input
 */
export async function ragToTtsWithFile(textMessage, pdfFile) {
  const formData = new FormData()
  formData.append('text_message', textMessage)
  formData.append('file', pdfFile)
  const response = await fetch(`${API_BASE_URL}/rag-to-tts`, {
    method: 'POST',
    body: formData,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = data?.detail ? JSON.stringify(data.detail) : `Request failed (${response.status})`
    throw new Error(detail)
  }
  return data
}

/**
 * POST /rag-to-tts — use PDF already uploaded via /documents/upload
 */
export async function ragToTtsWithStoragePath(textMessage, storagePath) {
  const formData = new FormData()
  formData.append('text_message', textMessage)
  formData.append('storage_path', storagePath)
  const response = await fetch(`${API_BASE_URL}/rag-to-tts`, {
    method: 'POST',
    body: formData,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = data?.detail ? JSON.stringify(data.detail) : `Request failed (${response.status})`
    throw new Error(detail)
  }
  return data
}
