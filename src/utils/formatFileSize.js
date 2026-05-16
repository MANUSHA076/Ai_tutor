export function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return ''
  const mb = bytes / 1024 / 1024
  if (mb < 0.1) return `${Math.round(bytes / 1024)} KB`
  return `${mb.toFixed(1)} MB`
}
