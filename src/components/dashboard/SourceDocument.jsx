import { motion } from 'framer-motion'
import { CloudUpload, FileText, Loader2, X } from 'lucide-react'
import { usePdfPicker } from '../../hooks/usePdfPicker'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function SourceDocument({ file, onFileSelect, onRemove, uploading = false, uploadError = '' }) {
  const picker = usePdfPicker(onFileSelect)

  return (
    <motion.section
      className="dash-card source-card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.45, delay: 0.15 }}
      whileHover={{ y: -2 }}
    >
      <input
        ref={picker.inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="pdf-file-input"
        onChange={picker.onInputChange}
        disabled={uploading}
        aria-hidden
        tabIndex={-1}
      />

      <motion.div
        className={`upload-zone ${picker.isDragging ? 'is-dragging' : ''} ${uploading ? 'is-uploading' : ''}`}
        onClick={() => !uploading && picker.openPicker()}
        onDragOver={picker.onDragOver}
        onDragLeave={picker.onDragLeave}
        onDrop={picker.onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => event.key === 'Enter' && !uploading && picker.openPicker()}
        whileHover={uploading ? {} : { scale: 1.01, borderColor: 'rgba(125, 211, 252, 0.5)' }}
        whileTap={uploading ? {} : { scale: 0.99 }}
      >
        <motion.div
          className="upload-icon-wrap"
          animate={uploading ? {} : { y: [0, -4, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {uploading ? <Loader2 className="icon-md spin-icon" /> : <CloudUpload className="icon-md" />}
        </motion.div>
        <p className="upload-title">{uploading ? 'Uploading…' : 'Drag and drop PDF here'}</p>
        <p className="upload-hint">or click to browse files</p>
      </motion.div>

      {(picker.error || uploadError) && (
        <p className="upload-error-msg" role="alert">
          {picker.error || uploadError}
        </p>
      )}

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
