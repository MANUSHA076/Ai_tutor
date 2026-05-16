import { API_BASE_URL } from './config'

/**
 * Shared HTTP client for Python (FastAPI) backend
 */
async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message = typeof data === 'object' && data?.detail
      ? JSON.stringify(data.detail)
      : `Request failed (${response.status})`
    throw new Error(message)
  }

  return data
}

export async function apiGet(path) {
  const response = await fetch(`${API_BASE_URL}${path}`)
  return parseResponse(response)
}

export async function apiPost(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseResponse(response)
}

export async function apiPut(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseResponse(response)
}

export async function apiUpload(path, formData) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    body: formData,
  })
  return parseResponse(response)
}
