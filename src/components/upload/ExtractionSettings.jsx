import { motion } from 'framer-motion'
import { SlidersHorizontal } from 'lucide-react'

const defaultOptions = [
  { id: 'images', label: 'Extract all images and diagrams', checked: true },
  { id: 'tables', label: 'Convert tables to structured data', checked: true },
  { id: 'ocr', label: 'Enable OCR for handwritten notes', checked: false },
]

export function ExtractionSettings({ options, onToggle, pageStart, pageEnd, onPageStart, onPageEnd }) {
  return (
    <motion.section
      className="upload-page-card extraction-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.18 }}
    >
      <div className="extraction-header">
        <SlidersHorizontal className="icon-sm" />
        <h3>Extraction Settings</h3>
      </div>

      <div className="checkbox-list">
        {options.map((option, index) => (
          <motion.label
            key={option.id}
            className="checkbox-row"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.22 + index * 0.06 }}
            whileHover={{ x: 2 }}
          >
            <input
              type="checkbox"
              checked={option.checked}
              onChange={() => onToggle(option.id)}
              className="checkbox-input"
            />
            <span className={`checkbox-box ${option.checked ? 'is-checked' : ''}`} />
            <span>{option.label}</span>
          </motion.label>
        ))}
      </div>

      <div className="page-range-section">
        <p className="page-range-label">Page Range</p>
        <div className="page-range-inputs">
          <input
            type="text"
            placeholder="Start"
            value={pageStart}
            onChange={(event) => onPageStart(event.target.value)}
            className="page-input"
          />
          <input
            type="text"
            placeholder="End"
            value={pageEnd}
            onChange={(event) => onPageEnd(event.target.value)}
            className="page-input"
          />
        </div>
        <p className="page-range-hint">Leave blank to process the entire document.</p>
      </div>
    </motion.section>
  )
}

export { defaultOptions as extractionDefaults }
