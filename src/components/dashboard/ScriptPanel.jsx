import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useLectureScript } from '../../hooks/useLectureScript'

const tabs = [
  { id: 'script', label: 'Generated Script' },
  { id: 'notes', label: 'Lecture Notes Summary' },
]

export function ScriptPanel({
  activeTab,
  onTabChange,
  ragSource = '',
  processing = false,
  canRagTts = false,
  ragTtsLoading = false,
  onGenerateRagTts,
  onGenerateAudioOnly,
  audioPrompt = '',
  ragTtsError = '',
  hasAudio = false,
}) {
  const { lines, summary, loading } = useLectureScript(activeTab, ragSource)

  return (
    <motion.section
      className="dash-card script-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.32 }}
    >
      <motion.div className="tab-row" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'is-active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.span
                className="tab-underline"
                layoutId="tab-underline"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </motion.div>

      {processing && (
        <p className="pipeline-status-msg">
          <Loader2 className="icon-sm spin-icon" /> Indexing PDF chunks…
        </p>
      )}
      {!processing && ragSource && (
        <p className="pipeline-status-msg pipeline-ready">Indexed: {ragSource}</p>
      )}

      <motion.div className="rag-tts-actions">
        {canRagTts && onGenerateRagTts && (
          <motion.button
            type="button"
            className="rag-tts-btn"
            disabled={ragTtsLoading}
            onClick={onGenerateRagTts}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {ragTtsLoading ? (
              <>
                <Loader2 className="icon-sm spin-icon" /> Generating script + video…
              </>
            ) : (
              'Generate lecture (RAG → Video)'
            )}
          </motion.button>
        )}
        {(audioPrompt || ragSource) && onGenerateAudioOnly && !hasAudio && (
          <motion.button
            type="button"
            className="rag-tts-btn rag-tts-btn-secondary"
            disabled={ragTtsLoading}
            onClick={onGenerateAudioOnly}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Video only (from script)
          </motion.button>
        )}
        {hasAudio && <p className="pipeline-status-msg pipeline-ready">Video ready — press play</p>}
      </motion.div>
      {ragTtsError && <p className="pipeline-error-msg">{ragTtsError}</p>}

      <motion.div className="tab-content">
        {loading ? (
          <p className="data-empty-msg">
            <Loader2 className="icon-sm spin-icon" /> Loading…
          </p>
        ) : lines.length === 0 && summary.length === 0 ? (
          <p className="data-empty-msg">
            {ragSource
              ? 'Indexing PDF… script will appear when ready.'
              : 'Upload a PDF to generate a script.'}
          </p>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'script' ? (
              <motion.div
                key="script"
                className="script-body"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
              >
                {lines.length === 0 ? (
                  <p className="data-empty-msg">
                    Upload a PDF or add lecture content in Supabase to generate a script.
                  </p>
                ) : audioPrompt ? (
                  <motion.pre className="audio-prompt-block" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {audioPrompt}
                  </motion.pre>
                ) : (
                  lines.map((line, index) => (
                    <motion.p
                      key={`${line.time}-${index}`}
                      className="script-line"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                    >
                      <span className="script-time">{line.time}</span>
                      {line.text}
                      {line.highlight && <mark className="script-highlight">{line.highlight}</mark>}
                      {line.term && <strong className="script-term">{line.term}</strong>}
                      {line.suffix}
                    </motion.p>
                  ))
                )}
              </motion.div>
            ) : (
              <motion.ul
                key="notes"
                className="notes-body"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
              >
                {summary.length === 0 ? (
                  <li className="data-empty-msg">No lecture notes yet. Add a description to your latest lecture.</li>
                ) : (
                  summary.map((note, index) => (
                    <motion.li
                      key={note}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 * index }}
                    >
                      {note}
                    </motion.li>
                  ))
                )}
              </motion.ul>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </motion.section>
  )
}
