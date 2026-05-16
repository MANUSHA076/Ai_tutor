import { apiGet, apiPost } from './client'

/** POST /documents/process — PDF → semantic chunks → Chroma index */
export function processDocument(storagePath, options = {}) {
  return apiPost('/documents/process', {
    storage_path: storagePath,
    threshold: options.threshold ?? 0.4,
    min_chars: options.minChars ?? 50,
  })
}

/** POST /rag/query — Hybrid search on a processed document */
export function ragQuery({ source, query, topN = 5 }) {
  return apiPost('/rag/query', { source, query, top_n: topN })
}

/** POST /generate-voice — Fal text2audio2video (test / studio) */
export function generateVoice(textPrompt, options = {}) {
  return apiPost(
    '/generate-voice',
    {
      text_prompt: textPrompt,
      avatar_id: options.avatarId || null,
      voice: options.voice || null,
      avatar_url: options.avatarUrl || null,
      video_prompt: options.videoPrompt || null,
      stability: options.stability ?? null,
    },
    300000,
  )
}

export { ragToTtsWithFile, ragToTtsWithStoragePath } from './ragToTtsApi'

/** GET /pipeline/status — Indexed sources in memory */
export function fetchPipelineStatus() {
  return apiGet('/pipeline/status')
}
