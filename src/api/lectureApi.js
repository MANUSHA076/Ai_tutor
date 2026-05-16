import { apiGet, apiPost } from './client'

const POLL_MS = 1500
const MAX_POLL_MS = 12 * 60 * 1000
const SYNC_TIMEOUT_MS = 600000

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function buildBody({
  storagePath,
  textMessage,
  scriptText,
  summaryText,
  fromSummary,
  avatarId,
  voice,
  avatarUrl,
  videoPrompt,
  stability,
  source,
}) {
  return {
    storage_path: storagePath || null,
    text_message: textMessage,
    script_text: scriptText || null,
    summary_text: summaryText || null,
    from_summary: Boolean(fromSummary),
    source: source || null,
    avatar_id: avatarId || null,
    voice: voice || null,
    avatar_url: avatarUrl || null,
    video_prompt: videoPrompt || null,
    stability: stability ?? null,
  }
}

function isNotFoundError(err) {
  const msg = (err?.message || '').toLowerCase()
  return msg.includes('not found') || msg.includes('404')
}

async function pollJob(jobId, onProgress) {
  const started = Date.now()
  while (Date.now() - started < MAX_POLL_MS) {
    const job = await apiGet(`/lecture/generate-audio/jobs/${jobId}`, 30000)
    if (typeof onProgress === 'function') {
      onProgress(job)
    }
    if (job.status === 'completed') {
      return {
        video_url: job.video_url,
        audio_url: job.audio_url,
        script: job.script,
        source: job.source,
      }
    }
    if (job.status === 'failed') {
      throw new Error(job.error || job.message || 'Video generation failed')
    }
    await sleep(POLL_MS)
  }
  throw new Error('Video generation timed out after 12 minutes.')
}

async function generateViaAsync(body, onProgress) {
  const { job_id: jobId } = await apiPost('/lecture/generate-audio/async', body, 60000)
  if (!jobId) {
    throw new Error('Backend did not return job_id')
  }
  return pollJob(jobId, onProgress)
}

async function generateViaSync(body, onProgress) {
  if (typeof onProgress === 'function') {
    onProgress({ message: 'Generating on Fal (direct mode, may take 5–10 min)…' })
  }
  return apiPost('/lecture/generate-audio', body, SYNC_TIMEOUT_MS)
}

/** Generate lecture video + audio (async job with sync fallback). */
export async function generateLectureAudio(options, onProgress) {
  const body = buildBody(options)

  try {
    return await generateViaAsync(body, onProgress)
  } catch (err) {
    if (isNotFoundError(err)) {
      return generateViaSync(body, onProgress)
    }
    throw err
  }
}
