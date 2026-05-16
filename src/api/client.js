import { API_BASE_URL } from './config'

const DEFAULT_TIMEOUT_MS = 20000

async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error(
        'Backend not responding. Open a terminal in backend folder and run: .\\start.ps1',
      )
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    if (typeof data === 'object' && data?.detail) {
      message = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)
    } else if (typeof data === 'string' && data) {
      message = data.slice(0, 500)
    }
    throw new Error(message)
  }

  return data
}

export async function apiGet(path, timeoutMs) {
  const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {}, timeoutMs)
  return parseResponse(response)
}

export async function apiPost(path, body, timeoutMs) {
  const response = await fetchWithTimeout(
    `${API_BASE_URL}${path}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    timeoutMs,
  )
  return parseResponse(response)
}

export async function apiPut(path, body, timeoutMs) {
  const response = await fetchWithTimeout(
    `${API_BASE_URL}${path}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    timeoutMs,
  )
  return parseResponse(response)
}

export async function apiUpload(path, formData, timeoutMs = 120000) {
  const response = await fetchWithTimeout(
    `${API_BASE_URL}${path}`,
    { method: 'POST', body: formData },
    timeoutMs,
  )
  return parseResponse(response)
}
