import { apiGet, apiPost } from './client'

/** GET /health — fast backend online check */
export function fetchHealth() {
  return apiGet('/health', 8000)
}

/** GET /home/session — Home dashboard source file, metrics, script */
export function fetchHomeSession() {
  return apiGet('/home/session', 15000)
}

/** POST /home/lecture/play — Video play/pause state sync (optional) */
export function syncLecturePlayback(payload) {
  return apiPost('/home/lecture/play', payload)
}

/** GET /home/script?tab=script|notes — Script panel tabs (optional pipeline source) */
export function fetchLectureScript(tab = 'script', options = {}) {
  const params = new URLSearchParams({ tab })
  if (options.source) params.set('source', options.source)
  if (options.lectureId != null) params.set('lecture_id', String(options.lectureId))
  return apiGet(`/home/script?${params}`)
}
