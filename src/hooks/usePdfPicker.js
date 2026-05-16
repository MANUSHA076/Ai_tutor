import { useCallback, useRef, useState } from 'react'
import { validatePdfFile } from '../utils/validatePdf'

export function usePdfPicker(onSelect) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')

  const openPicker = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const pickFile = useCallback(
    (file) => {
      const message = validatePdfFile(file)
      if (message) {
        setError(message)
        return
      }
      setError('')
      onSelect?.(file)
    },
    [onSelect],
  )

  const onInputChange = useCallback(
    (event) => {
      const file = event.target.files?.[0]
      if (file) pickFile(file)
      event.target.value = ''
    },
    [pickFile],
  )

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((event) => {
    event.preventDefault()
    setIsDragging(false)
  }, [])

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()
      setIsDragging(false)
      const file = event.dataTransfer.files?.[0]
      if (file) pickFile(file)
    },
    [pickFile],
  )

  return {
    inputRef,
    isDragging,
    error,
    setError,
    openPicker,
    onInputChange,
    onDragOver,
    onDragLeave,
    onDrop,
  }
}
