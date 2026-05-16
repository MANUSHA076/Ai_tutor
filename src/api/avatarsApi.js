import { apiGet, apiPost, apiPut } from './client'

/** GET /avatars — AI Avatar Studio base avatars list */
export function fetchAvatars() {
  return apiGet('/avatars')
}

/** GET /avatars/studio-config — Visual style, voice, background options */
export function fetchStudioConfig() {
  return apiGet('/avatars/studio-config')
}

/** PUT /avatars/profile — Save AI Tutor Profile (Studio page) */
export function saveAvatarProfile(profile) {
  return apiPut('/avatars/profile', profile)
}

/** POST /avatars/preview — Test voice & motion preview */
export function previewAvatar(payload) {
  return apiPost('/avatars/preview', payload)
}
