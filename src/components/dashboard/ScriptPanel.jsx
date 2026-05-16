import { AnimatePresence, motion } from 'framer-motion'
import { scriptLines, lectureSummary } from '../../data/scriptContent'
// BACKEND [Python]: fetchLectureScript(tab) — src/api/homeApi.js when tab changes

const tabs = [
  { id: 'script', label: 'Generated Script' },
  { id: 'notes', label: 'Lecture Notes Summary' },
]

export function ScriptPanel({ activeTab, onTabChange }) {
  return (
    <motion.section
      className="dash-card script-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.32 }}
    >
      <div className="tab-row" role="tablist">
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
      </div>

      <motion.div className="tab-content">
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
              {scriptLines.map((line, index) => (
                <motion.p
                  key={line.time}
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
              ))}
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
              {lectureSummary.map((note, index) => (
                <motion.li
                  key={note}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * index }}
                >
                  {note}
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.section>
  )
}
