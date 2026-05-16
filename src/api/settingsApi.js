import { apiGet, apiPut } from './client'

/** GET /settings — Load Settings page on mount */
export function fetchSettings() {
  return apiGet('/settings')
}

/** PUT /settings — Save Changes button */
export function updateSettings(settings) {
  return apiPut('/settings', settings)
}
