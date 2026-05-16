import { motion } from 'framer-motion'
import { CloudUpload, Loader2, Paperclip } from 'lucide-react'
import { usePdfPicker } from '../../hooks/usePdfPicker'

export function DocumentUploadZone({ onFileSelect, uploading = false, uploadError = '' }) {
  const picker = usePdfPicker(onFileSelect)

  return (
    <motion.section
      className="upload-page-card upload-drop-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
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
        className={`doc-upload-zone ${picker.isDragging ? 'is-dragging' : ''} ${uploading ? 'is-uploading' : ''}`}
        onClick={() => !uploading && picker.openPicker()}
        onDragOver={picker.onDragOver}
        onDragLeave={picker.onDragLeave}
        onDrop={picker.onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => event.key === 'Enter' && !uploading && picker.openPicker()}
        whileHover={uploading ? {} : { scale: 1.005, borderColor: 'rgba(52, 211, 153, 0.55)' }}
        whileTap={uploading ? {} : { scale: 0.995 }}
      >
        <motion.div
          className="doc-upload-icon"
          animate={uploading ? {} : { y: [0, -5, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {uploading ? <Loader2 className="icon-lg spin-icon" /> : <CloudUpload className="icon-lg" />}
        </motion.div>

        <h2 className="doc-upload-title">
          {uploading ? 'Uploading PDF…' : 'Drag & drop your PDF'}
        </h2>
        <p className="doc-upload-desc">
          Academic papers, textbook chapters, and manuals up to 50MB.
        </p>

        <motion.button
          type="button"
          className="browse-files-btn"
          disabled={uploading}
          onClick={(event) => {
            event.stopPropagation()
            picker.openPicker()
          }}
          whileHover={uploading ? {} : { scale: 1.03, boxShadow: '0 10px 28px rgba(52, 211, 153, 0.28)' }}
          whileTap={uploading ? {} : { scale: 0.97 }}
        >
          <Paperclip className="icon-sm" /> {uploading ? 'Please wait…' : 'Browse Files'}
        </motion.button>
      </motion.div>

      {(picker.error || uploadError) && (
        <p className="upload-error-msg" role="alert">
          {picker.error || uploadError}
        </p>
      )}
    </motion.section>
  )
}
