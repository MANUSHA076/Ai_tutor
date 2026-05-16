import { motion } from 'framer-motion'
import { DocumentUploadZone } from '../components/upload/DocumentUploadZone'
import { ExtractionSettings } from '../components/upload/ExtractionSettings'
import { StorageCard } from '../components/upload/StorageCard'
import { RecentUploads } from '../components/upload/RecentUploads'

// BACKEND [Python]: documentsApi — upload, recent list (see src/hooks/useDocuments.js)

export function UploadPage({
  extractionOptions,
  onToggleExtraction,
  pageStart,
  pageEnd,
  onPageStart,
  onPageEnd,
  onFileSelect,
  uploading,
  uploadError,
  onRefreshUploads,
  recentUploads,
  processing = false,
  processError = '',
  onProcessUpload,
  ragSource = '',
}) {
  return (
    <div className="upload-page">
      <motion.header
        className="upload-page-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1>Process New Document</h1>
        <p>Turn your static PDFs into interactive, AI-powered learning modules instantly.</p>
        {processing && <p className="pipeline-status-msg">Processing PDF into knowledge base…</p>}
        {processError && <p className="pipeline-error-msg">{processError}</p>}
        {ragSource && !processing && (
          <p className="pipeline-status-msg pipeline-ready">Ready for search: {ragSource}</p>
        )}
      </motion.header>

      <div className="upload-page-grid">
        <div className="upload-main">
          <DocumentUploadZone
            onFileSelect={onFileSelect}
            uploading={uploading}
            uploadError={uploadError}
          />
          <ExtractionSettings
            options={extractionOptions}
            onToggle={onToggleExtraction}
            pageStart={pageStart}
            pageEnd={pageEnd}
            onPageStart={onPageStart}
            onPageEnd={onPageEnd}
          />
        </div>

        <aside className="upload-sidebar">
          <StorageCard />
          <RecentUploads
            uploads={recentUploads}
            onRefresh={onRefreshUploads}
            onProcess={onProcessUpload}
            processingId={processing ? 'busy' : null}
          />
        </aside>
      </div>
    </div>
  )
}
