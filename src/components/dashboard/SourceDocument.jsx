import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CloudUpload, FileText, Loader2, X } from 'lucide-react'
import { usePdfPicker } from '../../hooks/usePdfPicker'
import { formatFileSize } from '../../utils/formatFileSize'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function SourceDocument({
  file,
  onFileSelect,
  onRemove,
  uploading = false,
  processing = false,
  uploadError = '',
  uploadWarning = '',
}) {
  const [localFile, setLocalFile] = useState(null)

  const handleSelect = useCallback(
    async (picked) => {
      setLocalFile({
        name: picked.name,
        size: formatFileSize(picked.size),
        pending: true,
      })
      try {
        await onFileSelect?.(picked)
      } catch {
        setLocalFile((prev) =>
          prev ? { ...prev, pending: false, failed: true } : null,
        )
      }
    },
    [onFileSelect],
  )

  const picker = usePdfPicker(handleSelect)
  const displayFile = file?.name ? file : localFile
  const hasFile = Boolean(displayFile?.name)
  const isBusy = uploading || processing || picker.busy || displayFile?.pending

  useEffect(() => {
    if (file?.name) setLocalFile(file)
  }, [file])

  const statusLabel = uploading
    ? 'Uploading...'
    : processing
      ? 'Indexing...'
      : displayFile?.failed
        ? 'Upload failed'
        : displayFile?.pending
          ? 'Preparing...'
          : 'Ready'

  return (
    <motion.section
      className="dash-card source-card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.45, delay: 0.15 }}
    >
      <input
        ref={picker.inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="pdf-file-input"
        onChange={picker.onInputChange}
        disabled={isBusy}
        aria-hidden
        tabIndex={-1}
      />

      <motion.div
        className={`upload-zone ${hasFile ? 'has-file' : ''} ${picker.isDragging ? 'is-dragging' : ''} ${isBusy ? 'is-uploading' : ''}`}
        onClick={() => !isBusy && picker.openPicker()}
        onDragOver={picker.onDragOver}
        onDragLeave={picker.onDragLeave}
        onDrop={picker.onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => event.key === 'Enter' && !isBusy && picker.openPicker()}
      >
        <motion.div
          className="upload-icon-wrap"
          animate={isBusy ? {} : { y: [0, -4, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {isBusy ? <Loader2 className="icon-md spin-icon" /> : <CloudUpload className="icon-md" />}
        </motion.div>
        <p className="upload-title">
          {isBusy ? 'Working on your PDF...' : hasFile ? 'Drop another PDF to replace' : 'Drag and drop PDF here'}
        </p>
        <p className="upload-hint">or click to browse files</p>
      </motion.div>

      {uploadWarning && (
        <p className="upload-warning-msg" role="status">
          {uploadWarning}
        </p>
      )}
      {(picker.error || uploadError) && (
        <p className="upload-error-msg" role="alert">
          {picker.error || uploadError}
        </p>
      )}

      {hasFile && (
        <motion.div
          className="file-row"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="file-info">
            <motion.div className="file-icon-wrap">
              {isBusy ? <Loader2 className="icon-sm spin-icon" /> : <FileText className="icon-sm" />}
            </motion.div>
            <motion.div className="file-meta">
              <p className="file-name">{displayFile.name}</p>
              <p className="file-size">
                {displayFile.size}
                {' Â· '}
                <span
                  className={`file-status ${displayFile.failed ? 'is-failed' : isBusy ? 'is-busy' : 'is-ready'}`}
                >
                  {statusLabel}
                </span>
              </p>
            </motion.div>
          </div>
          <motion.button
            type="button"
            className="file-remove"
            onClick={() => {
              setLocalFile(null)
              onRemove?.()
            }}
            disabled={isBusy}
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
