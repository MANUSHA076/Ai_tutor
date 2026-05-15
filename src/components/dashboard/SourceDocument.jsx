import { motion } from 'framer-motion'
import { CloudUpload, FileText, X } from 'lucide-react'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function SourceDocument({ file, onUpload, onRemove }) {
  return (
    <motion.section
      className="dash-card source-card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.45, delay: 0.15 }}
      whileHover={{ y: -2 }}
    >
      <div className="card-step">
        <span className="step-badge">Step 1</span>
        <h3>Source Document</h3>
      </div>

      <motion.button
        type="button"
        className="upload-zone"
        onClick={onUpload}
        whileHover={{ scale: 1.01, borderColor: 'rgba(125, 211, 252, 0.5)' }}
        whileTap={{ scale: 0.99 }}
      >
        <motion.div
          className="upload-icon-wrap"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <CloudUpload className="icon-md" />
        </motion.div>
        <p className="upload-title">Drag and drop PDF here</p>
        <p className="upload-hint">or click to browse files</p>
      </motion.button>

      {file && (
        <motion.div
          className="file-row"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          layout
        >
          <div className="file-info">
            <div className="file-icon-wrap">
              <FileText className="icon-sm" />
            </div>
            <div>
              <p className="file-name">{file.name}</p>
              <p className="file-size">{file.size}</p>
            </div>
          </div>
          <motion.button
            type="button"
            className="file-remove"
            onClick={onRemove}
            aria-label="Remove file"
            whileHover={{ scale: 1.1, color: '#fca5a5' }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="icon-sm" />
          </motion.button>
        </motion.div>
      )}
    </motion.section>
  )
}
