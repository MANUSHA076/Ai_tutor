import { apiGet, apiPost } from './client'

/** GET /lectures — My Lectures page */
export function fetchLectures(params = {}) {
  const query = new URLSearchParams()
  if (params.subject && params.subject !== 'All') query.set('subject', params.subject)
  if (params.sort) query.set('sort', params.sort)
  if (params.page) query.set('page', String(params.page))
  const qs = query.toString()
  return apiGet(`/lectures${qs ? `?${qs}` : ''}`)
}

/** GET /lectures/:id — Home lecture preview / View Lecture */
export function fetchLectureById(lectureId) {
  return apiGet(`/lectures/${lectureId}`)
}

/** POST /lectures/generate — Generate New Lecture card */
export function generateLecture(payload) {
  return apiPost('/lectures/generate', payload)
}
