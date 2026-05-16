/**
 * API base URL
 * - Local dev: Vite proxy `/api` → http://127.0.0.1:8000
 * - Vercel Services: `/_/backend` + `/api` (see vercel.json)
 */
function resolveApiBaseUrl() {
  const explicit = import.meta.env.VITE_API_BASE_URL
  if (explicit) {
    return String(explicit).replace(/\/$/, '')
  }

  const backendRoot =
    import.meta.env.VITE_BACKEND_URL || import.meta.env.NEXT_PUBLIC_BACKEND_URL
  if (backendRoot) {
    return `${String(backendRoot).replace(/\/$/, '')}/api`
  }

  return '/api'
}

export const API_BASE_URL = resolveApiBaseUrl()
