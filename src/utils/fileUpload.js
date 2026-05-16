export const MAX_PDF_BYTES = 50 * 1024 * 1024

export function validatePdfFile(file) {
  if (!file) return 'No file selected'
  const name = file.name?.toLowerCase() || ''
  if (!name.endsWith('.pdf') && file.type !== 'application/pdf') {
    return 'Only PDF files are allowed'
  }
  if (file.size > MAX_PDF_BYTES) {
    return 'File is too large (max 50 MB)'
  }
  return null
}
