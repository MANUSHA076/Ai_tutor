import { apiGet, apiPost } from './client'

/** GET /home/session — Home dashboard source file, metrics, script */
export function fetchHomeSession() {
  return apiGet('/home/session')
}

/** POST /home/lecture/play — Video play/pause state sync (optional) */
export function syncLecturePlayback(payload) {
  return apiPost('/home/lecture/play', payload)
}

/** GET /home/script?tab=script|notes — Script panel tabs */
export function fetchLectureScript(tab = 'script') {
  return apiGet(`/home/script?tab=${tab}`)
}
