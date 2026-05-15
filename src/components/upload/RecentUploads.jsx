import { motion } from 'framer-motion'
import { AlertTriangle, FileText, Info, RefreshCw, Loader2 } from 'lucide-react'

const statusIcon = {
  ready: FileText,
  processing: Loader2,
  failed: AlertTriangle,
}

const statusClass = {
  ready: 'status-ready',
  processing: 'status-processing',
  failed: 'status-failed',
}

export function RecentUploads({ uploads }) {
  return (
    <motion.section
      className="upload-page-card recent-card"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="recent-header">
        <h3>Recent Uploads</h3>
        <motion.button
          type="button"
          className="refresh-btn"
          aria-label="Refresh"
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.4 }}
        >
          <RefreshCw className="icon-sm" />
        </motion.button>
      </div>

      <ul className="recent-list">
        {uploads.map((file, index) => {
          const Icon = statusIcon[file.status]

          return (
            <motion.li
              key={file.id}
              className="recent-item"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + index * 0.07 }}
              whileHover={{ x: 3, backgroundColor: 'rgba(255,255,255,0.04)' }}
            >
              <div className={`recent-icon ${statusClass[file.status]}`}>
                <Icon className={`icon-sm ${file.status === 'processing' ? 'spin-icon' : ''}`} />
              </div>
              <div className="recent-info">
                <p className="recent-name">{file.name}</p>
                <p className={`recent-status ${statusClass[file.status]}`}>
                  {file.label}
                  {file.size ? ` · ${file.size}` : ''}
                </p>
                {file.status === 'processing' && file.progress && (
                  <motion.div
                    className="recent-progress"
                    initial={{ width: 0 }}
                    animate={{ width: `${file.progress}%` }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  />
                )}
              </div>
              {file.status === 'failed' && (
                <motion.button
                  type="button"
                  className="info-btn"
                  aria-label="More info"
                  whileHover={{ scale: 1.1 }}
                >
                  <Info className="icon-sm" />
                </motion.button>
              )}
            </motion.li>
          )
        })}
      </ul>

      <motion.button
        type="button"
        className="view-all-link"
        whileHover={{ x: 2 }}
      >
        View All Documents
      </motion.button>
    </motion.section>
  )
}
