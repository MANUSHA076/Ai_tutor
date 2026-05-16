import { apiGet } from './client'

/** GET /search?q=... — TopBar search (lectures / avatars / knowledge base) */
export function searchKnowledgeBase(query, scope = 'all') {
  const params = new URLSearchParams({ q: query, scope })
  return apiGet(`/search?${params}`)
}
