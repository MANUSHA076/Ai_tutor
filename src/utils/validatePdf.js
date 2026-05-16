const MAX_MB = 50

export function validatePdfFile(file) {
  if (!file) return 'Please choose a PDF file.'
  const isPdf =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!isPdf) return 'Only PDF files are supported.'
  if (file.size > MAX_MB * 1024 * 1024) return `File must be smaller than ${MAX_MB} MB.`
  return null
}
