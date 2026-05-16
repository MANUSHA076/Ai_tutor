import { motion } from 'framer-motion'
import { CloudUpload, Paperclip } from 'lucide-react'

// BACKEND [Python]: POST /api/documents/upload via useDocuments().uploadFile()
// Replace onBrowse with <input type="file" accept=".pdf" /> and call uploadFile(file)

export function DocumentUploadZone({ onBrowse }) {
  return (
    <motion.section
      className="upload-page-card upload-drop-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <motion.div
        className="doc-upload-zone"
        onClick={onBrowse}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => event.key === 'Enter' && onBrowse()}
        whileHover={{ scale: 1.005, borderColor: 'rgba(52, 211, 153, 0.55)' }}
        whileTap={{ scale: 0.995 }}
      >
        <motion.div
          className="doc-upload-icon"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <CloudUpload className="icon-lg" />
        </motion.div>

        <h2 className="doc-upload-title">Drag &amp; drop your PDF</h2>
        <p className="doc-upload-desc">
          Support for academic papers, textbook chapters, and technical manuals up to 50MB.
        </p>

        <motion.button
          type="button"
          className="browse-files-btn"
          onClick={(event) => {
            event.stopPropagation()
            onBrowse()
          }}
          whileHover={{ scale: 1.03, boxShadow: '0 10px 28px rgba(52, 211, 153, 0.28)' }}
          whileTap={{ scale: 0.97 }}
        >
          <Paperclip className="icon-sm" /> Browse Files
        </motion.button>
      </motion.div>
    </motion.section>
  )
}
