export const PDF_MAX_BYTES = 50 * 1024 * 1024

export function validatePdfFile(file) {
  if (!file) return 'No file selected'
  const name = file.name?.toLowerCase() ?? ''
  if (!name.endsWith('.pdf') && file.type !== 'application/pdf') {
    return 'Only PDF files are allowed'
  }
  if (file.size > PDF_MAX_BYTES) {
    return 'File must be 50MB or smaller'
  }
  return null
}
