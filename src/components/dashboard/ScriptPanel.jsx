import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useLectureScript } from '../../hooks/useLectureScript'

const tabs = [
  { id: 'script', label: 'Generated Script' },
  { id: 'notes', label: 'Lecture Notes Summary' },
]

export function ScriptPanel({ activeTab, onTabChange }) {
  const { lines, summary, loading } = useLectureScript(activeTab)

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

      <motion.div className="tab-content">
        {loading ? (
          <p className="data-empty-msg">
            <Loader2 className="icon-sm spin-icon" /> Loading…
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
